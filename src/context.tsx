import React from "react";
import { useMachine } from "@xstate/react";
import { Machine } from "xstate";
import { converterMachine } from "./machine";
import { IConverter, IConversionType } from "../types";
import { State } from "xstate";

export const isString = (value: unknown): value is string => {
  return typeof value === "string";
};

const useRouter = () => {
  return { query: { fileName: 'file-name.jpg', type: 'type1' } };
}

export type IEvent =
  | IOAuth2Figma;

interface IOAuth2Figma {
  type: "OAUTH2_FIGMA";
  fileURL: string;
}

export interface IContext {
  disabled: boolean | false;
}

export type IConverterSend = (
  event: IEvent | IEvent["type"]
) => State<IContext, IEvent>;

export interface IState {
  current: State<IContext, IEvent>;
  send: IConverterSend;
}

const Context = React.createContext<IState | null>(null);

type IProps = Omit<IConverter, "legalText">;

export const ConverterProvider: React.FC<IProps> = React.memo(
  ({ options, disabled = false, ...rest }) => {
    const router = useRouter();
    const { fileName, type } = router.query;
    const conversionType = type as IConversionType;

    const uploadedFileName =
      isString(fileName) && fileName.length > 0 ? fileName : null;

    const [current, send] = useMachine(converterMachine, {
      context: {
        disabled,
        uploadedFileName,
        // TODO - Enable free conversion
        allowFreeConversion: false,
        conversionOptions: options || [],
        conversionType: conversionType || "XD_TO_SKETCH"
      }
    });

    return <Context.Provider value={{ current, send }} {...rest} />;
  }
);

export const useConverterContext = () => {
  const context = React.useContext(Context);

  if (!context) {
    throw Error("useConverterContext: Please provide provider value.");
  }

  return context;
};
