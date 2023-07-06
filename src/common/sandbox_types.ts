/**
 * Sandbox types
 */
export enum SbxCommand {
  RunFunc,
  RunFuncRes,
}

export interface SbxInRunFunc {
  body: string
  inputs?: any[]
  res_key?: string
}

export interface SbxInRunFuncRes {
  res_key: string
  inputs?: any[]
  subkeys?: any[]
}

/**
 * Sandbox input
 */
export interface SbxIn<T> {
  command: SbxCommand
  data: T
}

/**
 * Sandbox output
 */
export interface SbxOut<T> {
  status: SbxOutStatus
  message: string
  data?: T
}

/**
 * Sandbox output status
 */
export enum SbxOutStatus {
  Error,
  Ok,
}
