const concatUint8Arrays = (original, newData) => {
    const newArr = new Uint8Array(original.byteLength + newData.byteLength);
    const dv = new DataView(newArr.buffer);

    original.forEach((el, i) => {
        dv.setInt8(i, el);
    });

    newData.forEach((el, i) => {
        dv.setInt8(original.byteLength + i, el);
    });

    return newArr;
}

export default concatUint8Arrays;
