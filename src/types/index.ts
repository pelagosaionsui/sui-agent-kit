export interface Config {
    OPENAI_API_KEY?: string;
    DEEPSEEK_API_KEY?: string;
}

export interface PythPriceFeedIDItem {
    id: string;
    attributes: {
        asset_type: string;
        base: string;
        display_symbol: string;
    }
}