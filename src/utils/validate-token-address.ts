/**
 * Checks if the provided address is a valid SUI token address.
 *
 * A valid SUI token address must:
 * - Be defined (not undefined or null).
 * - Be exactly "0x2::sui::SUI".
 * - Match the regex pattern: /^0x[a-fA-F0-9]{64}(::[a-zA-Z0-9_]+)*$/.
 *
 * If the address is invalid, an error message will be logged to the console.
 *
 * @param address - The SUI token address to validate.
 * @returns `true` if the address is valid, `false` otherwise.
 */
export function isValidSuiTokenAddress(address: string | undefined): boolean {
    if (!address) {
        return false;
    }

    if (address === "0x2::sui::SUI") {
        return true;
    }

    const suiTokenAddressRegex = /^0x[a-fA-F0-9]{64}(::[a-zA-Z0-9_]+)*$/;
    const isValid = suiTokenAddressRegex.test(address);

    if (!isValid) {
        console.error(`Invalid SUI address: ${address}`);
    }

    return isValid;
}