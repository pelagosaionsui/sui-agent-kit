export function isValidSuiTokenAddress(address: string | undefined): boolean {
    if (!address) {
        return false;
    }

    const suiTokenAddressRegex = /^0x[a-fA-F0-9]{64}(::[a-zA-Z0-9_]+)*$/;
    const isValid = suiTokenAddressRegex.test(address);

    if (!isValid) {
        console.error(`Invalid SUI address: ${address}`);
    }

    return isValid;
}