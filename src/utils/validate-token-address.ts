export function isValidSuiAddress(address: string | undefined): boolean {
    if (!address) {
        return false;
    }

    const suiAddressRegex = /^0x[a-fA-F0-9]{64}(::[a-zA-Z0-9_]+)*$/;
    const isValid = suiAddressRegex.test(address);

    if (!isValid) {
        console.error(`Invalid SUI address: ${address}`);
    }

    return isValid;
}