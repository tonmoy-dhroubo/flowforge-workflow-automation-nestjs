export interface ActionPlugin {
  getType(): string;
  execute(config: Record<string, any>, context: Record<string, any>): Promise<Record<string, any>>;
}
