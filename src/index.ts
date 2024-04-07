import { Result, err, ok } from 'neverthrow'

export type TAsyncResult<T, E> = Promise<Result<T, E>>

export interface ITransaction<T> {
    name: string
    execute: (args: T) => Promise<T>,
    compensate: (args: T) => Promise<T>
}

/**
 * Represents a Saga object that manages a series of transactions and handles any errors that occur during execution.
 * @template T The type of arguments passed to the transactions.
 */
export class Saga<T> {
    private _transactions: ITransaction<T>[] = []

    static new<T>(): Saga<T> {
        return new Saga()
    }

    /**
     * Adds a transaction to the list of transactions in a Saga object.
     * @param transaction The transaction object to be added.
     * @returns The Saga object itself to allow method chaining.
     */
    addTransaction(transaction: ITransaction<T>): Saga<T> {
        this._transactions.push(transaction);
        return this;
    }

    /**
     * Executes a series of transactions and handles any errors that occur during execution.
     * @param args The arguments passed to the execute method.
     * @returns A promise that resolves to an ok result with undefined value if all transactions are executed successfully.
     *          If any transaction fails, the promise resolves to an err result containing the error thrown by the failed transaction or the error thrown by the compensation logic if it fails.
     */
    async execute(args: T): TAsyncResult<void, Error> {
        for (let i = 0; i < this._transactions.length; i++) {
            const { execute } = this._transactions[i];
            try {
                args = await execute(args);
            } catch (e) {
                return this._startCompensate(i, args, e as Error);
            }
        }
        return ok(undefined);
    }

    /**
     * Executes the compensation logic for failed transactions in reverse order.
     * @param idx - The index of the failed transaction in the `_transactions` array.
     * @param args - The arguments passed to the failed transaction.
     * @param error - The error thrown by the failed transaction.
     * @returns A promise that resolves to an `err` result containing the original error thrown by the failed transaction,
     * or an `err` result with the error thrown by the compensation logic if it fails.
     */
    private async _startCompensate(idx: number, args: T, error: Error): TAsyncResult<void, Error> {
        for (let i = idx - 1; i >= 0; i--) {
            try {
                args = await this._transactions[i].compensate(args);
            } catch (e) {
                // nothing to do here
            }
        }
        return err(error);
    }
}