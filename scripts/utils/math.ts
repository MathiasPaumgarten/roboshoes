export function overflow( value: number , min: number, max?: number ): number {
    if ( max === undefined ) {
        max = min;
        min = 0;
    }

    const difference = max - min;

    while( value >= max ) value -= difference;
    while( value < min ) value += difference;

    return value;
};

