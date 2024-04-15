export interface EnvelopeContextEntry<V> {
  /**
   * Entry value
   * */
  value: V;

  /**
   * Indicates if values is serializable. If sent to false, it will be omitted while sending request or response.
   * */
  isSerializable: boolean;
}

export type EnvelopeContext<Ctx> = {
  [Key in keyof Ctx]: EnvelopeContextEntry<Ctx[Key]>;
};
