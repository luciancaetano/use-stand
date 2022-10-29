class MiddlewareConfigStore {
  private middlewaresSettings: Record<string, Record<string, any>> = {};

  public clearMiddlewareConfig = (middleWareName: string) => {
    delete this.middlewaresSettings[middleWareName];
  };

  public getMiddlewareConfig = <T>(middleWareName: string, key: string): T | undefined => {
    if (this.middlewaresSettings[middleWareName]) {
      return this.middlewaresSettings[middleWareName][key];
    }

    return undefined;
  };

  public setMiddlewareConfig = <T>(middleWareName: string, key: string, value: T) => {
    this.middlewaresSettings[middleWareName] = {
      ...this.middlewaresSettings[middleWareName] || {},
      [key]: value,
    };
  };
}

export default MiddlewareConfigStore;
