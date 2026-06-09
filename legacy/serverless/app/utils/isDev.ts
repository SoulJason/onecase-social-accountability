import process from "process";

const development: boolean = process.env.NODE_ENV === "dev";

export default function isDev(): boolean {
  return development;
}
