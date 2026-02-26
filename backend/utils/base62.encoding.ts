export function Base62Encode(id : number) : string{
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let encoded = "";
    while (id > 0) {
        encoded = chars[id % 62] + encoded;
        id = Math.floor(id / 62);
    }
    return encoded || "0";
}