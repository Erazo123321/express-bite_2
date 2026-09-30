/**
 * Value Object: Money
 * Encapsulates monetary amounts and business rules (e.g. non-negative, currency formatting).
 * Immutability guarantees side-effect free operations.
 */
export class Money {
  private readonly _amount: number;
  private readonly _currency: string;

  constructor(amount: number, currency: string = 'CLP') {
    if (isNaN(amount) || amount < 0) {
      throw new Error(`Monetary amount cannot be negative or invalid: ${amount}`);
    }
    this._amount = Math.round(amount);
    this._currency = currency;
  }

  get amount(): number {
    return this._amount;
  }

  get currency(): string {
    return this._currency;
  }

  add(other: Money): Money {
    this.ensureSameCurrency(other);
    return new Money(this._amount + other._amount, this._currency);
  }

  multiply(multiplier: number): Money {
    if (multiplier < 0) {
      throw new Error('Multiplier cannot be negative');
    }
    return new Money(Math.round(this._amount * multiplier), this._currency);
  }

  format(): string {
    // Formats as $2.400
    const formatted = new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: this._currency,
      maximumFractionDigits: 0,
    }).format(this._amount);

    return formatted;
  }

  equals(other: Money): boolean {
    return this._amount === other._amount && this._currency === other._currency;
  }

  private ensureSameCurrency(other: Money): void {
    if (this._currency !== other._currency) {
      throw new Error(`Cannot operate across different currencies: ${this._currency} and ${other._currency}`);
    }
  }

  static fromNumber(amount: number, currency: string = 'CLP'): Money {
    return new Money(amount, currency);
  }

  static zero(currency: string = 'CLP'): Money {
    return new Money(0, currency);
  }
}
