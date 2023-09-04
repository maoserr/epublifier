/**
 * Runs a script in sandbox
 */
export interface SbxInRunFunc {
  body: string
  inputs?: any[]
  res_key?: string
}

/**
 * Runs a previously loaded sandbox function
 */
export interface SbxInRunFuncRes {
  res_key: string
  inputs?: any[]
  subkeys?: any[]
}

/**
 * Different msg commands
 */
export enum MsgCommand {
  SbxRunFunc,
  SbxRunFuncRes,
}

/**
 * Msg input
 */
export interface MsgIn<T> {
  command: MsgCommand
  data: T
}

/**
 * Msg internal input
 */
export interface MsgInInternal<T> {
  msg_id: number
  msg_in: MsgIn<T>
}

/**
 * Msg output
 */
export interface MsgOut<T> {
  status: MsgOutStatus
  message: string
  data?: T
}

/**
 * Msg internal output
 */
export interface MsgOutInternal<T> {
  msg_id: number
  msg_out: MsgOut<T>
}


/**
 * Msg output status
 */
export enum MsgOutStatus {
  Error,
  Ok,
}



