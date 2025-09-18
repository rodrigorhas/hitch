/**
 * FontManager - Gerencia fontes para evitar conflitos entre sistemas
 */
export class FontManager {
    static #defaultFont = '12px Arial';
    static #currentFont = this.#defaultFont;

    /**
     * Define uma fonte temporariamente
     * @param {CanvasRenderingContext2D} ctx - Contexto do canvas
     * @param {string} font - Fonte a ser usada
     * @returns {Function} - Função para restaurar a fonte original
     */
    static useFont(ctx, font) {
        const originalFont = ctx.font;
        ctx.font = font;
        this.#currentFont = font;
        
        return () => {
            ctx.font = originalFont;
            this.#currentFont = originalFont;
        };
    }

    /**
     * Restaura a fonte padrão
     * @param {CanvasRenderingContext2D} ctx - Contexto do canvas
     */
    static restoreDefault(ctx) {
        ctx.font = this.#defaultFont;
        this.#currentFont = this.#defaultFont;
    }

    /**
     * Retorna a fonte atual
     * @returns {string}
     */
    static getCurrentFont() {
        return this.#currentFont;
    }

    /**
     * Define a fonte padrão
     * @param {string} font - Nova fonte padrão
     */
    static setDefaultFont(font) {
        this.#defaultFont = font;
    }
}
