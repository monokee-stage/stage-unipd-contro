import crypto from "crypto";

export function loadEnvironmentVariable(environmentVariableName: string): string {
  const variable = process.env[environmentVariableName];
  if (!variable) {
    throw new Error(environmentVariableName + ' is undefined')
  } else {
    return variable
  }
}

export function base64URLEncode(str: Buffer) {
  return str.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

export function sha256(buffer: string) {
  return crypto.createHash('sha256').update(buffer).digest();
}