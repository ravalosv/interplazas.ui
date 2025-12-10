import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FormulaService {
  constructor() {}

  /**
   * Verifica si una fórmula es válida, considerando paréntesis, operadores, agrupadores y tokens.
   * @param formula La fórmula a validar.
   * @param tokens Un arreglo de nombres de tokens válidos que se pueden encontrar en la fórmula.
   * @returns `true` si la fórmula es válida, `false` si no lo es.
   */
  public isFormulaValid(formula: string, tokens: string[]): boolean {
    const stack = []; // Utilizada para rastrear los paréntesis abiertos
    const operators = ['+', '-', '*', '/']; // Lista de operadores válidos
    const tokenRegex = new RegExp(`{(${tokens.join('|')})}`, 'g');

    // Reemplaza los tokens con un valor temporal (en este caso, '1') en la fórmula.
    formula = formula.replace(tokenRegex, '1');

    for (let i = 0; i < formula.length; i++) {
      const char = formula[i];

      if (operators.includes(char)) {
        // Verifica las incongruencias en los operadores
        if (
          i === 0 || // Operador al principio de la fórmula
          i === formula.length - 1 || // Operador al final de la fórmula
          operators.includes(formula[i - 1]) || // Operador precedido por otro operador
          operators.includes(formula[i + 1]) // Operador seguido por otro operador
        ) {
          return false; // Operador no válido
        }
      } else if (char === '(') {
        stack.push(char);
      } else if (char === ')') {
        if (stack.length === 0 || stack.pop() !== '(') {
          return false; // Los paréntesis no están balanceados
        }
      } else if (char === '{' || char === '}') {
        // Los caracteres dentro de las llaves se consideran válidos
      } else if (!this.isNumeric(char)) {
        return false; // Carácter no válido
      }
    }

    return stack.length === 0; // Verifica si los paréntesis están balanceados correctamente.
  }

  /**
   * Evalúa una fórmula matemática dada, reemplazando los tokens con los valores proporcionados.
   * @param formula La fórmula matemática a evaluar, donde los tokens están representados entre llaves {}.
   * @param parameters Un objeto que contiene los valores de los tokens como pares clave-valor.
   * @returns El resultado de la evaluación de la fórmula, o `null` si la fórmula es inválida o no se puede evaluar.
   */
  public evaluateFormula(
    formula: string,
    parameters: { [key: string]: number }
  ): number | null {
    // Reemplaza los tokens en la fórmula con sus valores correspondientes
    const formulaWithValues = this.replaceTokensWithValues(formula, parameters);

    try {
      // Intenta evaluar la fórmula utilizando la función eval()
      const result = eval(formulaWithValues);

      // Verifica si el resultado es un número válido
      if (isNaN(result)) {
        return null; // La fórmula es inválida
      }

      return result;
    } catch (error) {
      return null; // Error al evaluar la fórmula
    }
  }

  private replaceTokensWithValues(
    formula: string,
    parameters: { [key: string]: number }
  ): string {
    const tokenRegex = /{([^{}]+)}/g;

    return formula.replace(tokenRegex, (match, token) => {
      // Buscar el valor del token en los parámetros
      const value = parameters[token];
      if (value !== undefined) {
        return value.toString();
      } else {
        return match; // El token no tiene un valor válido
      }
    });
  }

  private isNumeric(char: string): boolean {
    return /^[0-9]+$/.test(char);
  }
}
