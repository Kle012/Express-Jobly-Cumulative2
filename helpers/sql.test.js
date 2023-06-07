const { sqlForPartialUpdate } = require('./sql');

describe('sqlForPartialUpdate helper', () => {
    test('works: 1 item', () => {
        const result = sqlForPartialUpdate(
            { f1: 'v1' },
            { f1: 'f1', fjs2: 'f2'}
        );

        expect(result).toEqual({
            setCols: "\"f1\"=$1",
            values: ["v1"],
        });
    });

    test('works: 2 items', () => {
        const result = sqlForPartialUpdate(
            { f1: 'v1', fjs2: 'v2'},
            { fjs2: "f2"}
        );

        expect(result).toEqual({
            setCols: "\"f1\"=$1, \"f2\"=$2",
            values: ["v1", "v2"]
        });
    });
});

