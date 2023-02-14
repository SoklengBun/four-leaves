import { createI18n } from "vue-i18n";
import enUS from "./en-US.json";
import jaJP from "./ja-JP.json";

type MessageSchema = typeof enUS;

const supportLanguage: {
  [key: string]: {
    name: string;
    file: MessageSchema;
    image?: string;
    label?: string;
  };
} = {
  "en-US": { name: "English", file: enUS, label: "En" },
  "ja-JP": { name: "Japan", file: jaJP, label: "Ja" },
};

const message: { [key: string]: MessageSchema } = {};
Object.keys(supportLanguage).forEach((key: string) => {
  message[key] = supportLanguage[key].file;
});

const i18n = createI18n<{ message: MessageSchema }, string>({
  legacy: false,
  locale: "en-US",
  allowComposition: true,
  globalInjection: true,
  messages: message,
});

type RecursiveKeyOf<TObj extends object> = {
  [TKey in keyof TObj & (string | number)]: RecursiveKeyOfHandleValue<
    TObj[TKey],
    `${TKey}`
  >;
}[keyof TObj & (string | number)];

type RecursiveKeyOfInner<TObj extends object> = {
  [TKey in keyof TObj & (string | number)]: RecursiveKeyOfHandleValue<
    TObj[TKey],
    `['${TKey}']` | `.${TKey}`
  >;
}[keyof TObj & (string | number)];

type RecursiveKeyOfHandleValue<
  TValue,
  Text extends string
> = TValue extends any[]
  ? Text
  : TValue extends object
  ? Text | `${Text}${RecursiveKeyOfInner<TValue>}`
  : Text;

type TxKeyPath = RecursiveKeyOf<MessageSchema>;

// You may change name base on what you wnat
function t(key: TxKeyPath) {
  return i18n.global.t(key);
}
export { i18n, t, supportLanguage };
