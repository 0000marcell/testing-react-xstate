import { Machine } from "xstate";
import { InvokeCreator } from "xstate";
import { assign } from "xstate";

export interface IContext {
  disabled: boolean | false;
}

interface IOAuth2Figma {
  type: "OAUTH2_FIGMA";
  fileURL: string;
}

export type IEvent =
  | IOAuth2Figma;

export interface ISchema {
  states: {
    init: {};
    disabled: {};
    selectingFile: {};
    droppedFile: {};
    uploading: {};
    oauth2: {};
    processing: {
      states: {
        fetching: {};
        failure: {};
      };
    };
    fetchingFile: {};
    preview: {};
    converting: {};
    polling: {
      states: {
        fetching: {};
        failure: {};
      };
    };
    payment: {};
    checkout: {};
    error: {};
  };
}

// service
export const oauth2Service: InvokeCreator<any> = (ctx: IContext) => {
  return new Promise(() => {});
};


// action 
export const oauth2Figma = assign<IContext, IEvent>({
  fileURL: (_ctx, event) =>
    (event.type === "OAUTH2_FIGMA" && event.fileURL) || null
});

export const converterMachine = Machine<IContext, ISchema, IEvent>(
  {
    id: "converter",
    initial: "init",
    context: {
      disabled: false
    },
    states: {
      init: {
        on: {
          "": [
            { target: "disabled", cond: "isDisabledUploadForm" },
            { target: "fetchingFile", cond: "doesUploadedFileNameExists" },
            { target: "selectingFile" }
          ]
        }
      },
      disabled: {
        type: "final"
      },
      selectingFile: {
        on: {
          SELECT_FILE: {
            target: "droppedFile",
            actions: "selectFile"
          },
          SET_CONVERSION_TYPE: {
            actions: "setConversionType"
          },
          SUBMIT_FILE_URL: {
            actions: "submitFileURLData",
            target: "uploading"
          },
          OAUTH2_FIGMA: {
            actions: "oauth2Figma",
            target: "oauth2"
          }
        }
      },
      droppedFile: {
        on: {
          SUBMIT_FILE_FORM: {
            actions: "submitFileForm",
            target: "uploading"
          },
          SET_CONVERSION_TYPE: {
            actions: "setConversionType"
          },
          RESET_FILE: {
            actions: "resetFile",
            target: "selectingFile"
          }
        }
      },
      oauth2: {
        invoke: {
          id: "oauth2",
          src: "oauth2Service"
        }
      },
      uploading: {
        invoke: {
          id: "uploadFile",
          src: "uploadFileService",
          onDone: {
            target: "processing",
            actions: "setUploadedFileData"
          },
          onError: {
            actions: "setUploadingError",
            target: "error"
          }
        },
        on: {
          SET_UPLOAD_PROGRESS: {
            actions: "setUploadProgress"
          }
        }
      },
      processing: {
        initial: "fetching",
        after: {
          PROCESSING_TIMEOUT: {
            actions: "setProcessingTimeoutError",
            target: "error"
          }
        },
        states: {
          fetching: {
            invoke: {
              src: "processingFileService",
              onError: {
                actions: "setProcessingRequestError",
                target: "#converter.error"
              },
              onDone: [
                {
                  actions: "redirectToFilePage",
                  cond: "isProcessingDone"
                },
                {
                  target: "#converter.error",
                  cond: "hasProcessingFailed"
                },
                { target: "failure" }
              ]
            }
          },
          failure: {
            after: {
              PROCESSING_INTERVAL: "fetching"
            }
          }
        }
      },
      fetchingFile: {
        onEntry: "resetUploadedFileDetails",
        invoke: {
          id: "fileDetails",
          src: "fileDetailsService",
          onDone: {
            actions: "setUploadedFileDetails",
            target: "preview"
          },
          onError: {
            actions: "setFileFetchingError",
            target: "error"
          }
        }
      },
      preview: {
        on: {
          SELECT_CONVERSION_PLAN: [
            {
              actions: "selectConversionPlan",
              target: "converting",
              cond: "isFreeConversion"
            },
            {
              actions: "selectConversionPlan",
              target: "payment"
            }
          ],
          CONVERT_ANOTHER_FILE: {
            actions: ["resetUploadedFileDetails", "redirectToLandingPage"]
          }
        }
      },
      converting: {
        invoke: {
          id: "convertFile",
          src: "convertFileService",
          onDone: {
            target: "polling"
          },
          onError: {
            actions: "setConvertingError",
            target: "error"
          }
        }
      },
      polling: {
        initial: "fetching",
        after: {
          POLL_TIMEOUT: {
            actions: "setPollingTimeoutError",
            target: "error"
          }
        },
        states: {
          fetching: {
            invoke: {
              src: "convertStatusService",
              onError: {
                actions: "setPollingRequestError",
                target: "#converter.error"
              },
              onDone: [
                {
                  target: "#converter.error",
                  cond: "hasConversionFailed"
                },
                {
                  actions: "setConversionProgress",
                  target: "#converter.fetchingFile",
                  cond: "isConversionDone"
                },
                {
                  actions: "setConversionProgress",
                  target: "failure"
                }
              ]
            }
          },
          failure: {
            after: {
              POLL_INTERVAL: "fetching"
            }
          }
        }
      },
      payment: {
        on: {
          SELECT_PAYMENT_TYPE: {
            actions: "selectPaymentType",
            target: "checkout"
          },
          GO_TO_PREVIEW: {
            target: "preview"
          }
        }
      },
      checkout: {
        invoke: {
          id: "handleCheckout",
          src: "handleCheckoutService",
          onDone: {
            target: "converting",
            actions: "setHostedPageId"
          }
        },
        on: {
          SELECT_CONVERSION_PLAN: {
            actions: "selectConversionPlan",
            target: "checkout"
          },
          SELECT_PAYMENT_TYPE: {
            actions: "selectPaymentType",
            target: "checkout"
          },
          GO_TO_PREVIEW: {
            target: "preview"
          }
        }
      },
      error: {
        entry: "logMachineError"
      }
    }
  },
  {
    actions: {
      oauth2Figma
    },
    services: {
      oauth2Service,
    },
    delays: {
      POLL_INTERVAL: 3000,
      POLL_TIMEOUT: 9999999,
      PROCESSING_INTERVAL: 2000,
      PROCESSING_TIMEOUT: 9999999
    }
  }
);
