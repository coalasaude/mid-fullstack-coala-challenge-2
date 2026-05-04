export abstract class Entity<Props extends { id: string }> {
  protected readonly props: Props;

  constructor(props: Props) {
    this.props = props;
  }

  get id(): string {
    return this.props.id;
  }

  equals(other?: Entity<Props>): boolean {
    if (!other) return false;
    if (this === other) return true;
    return this.id === other.id;
  }
}
