import { EmpireData } from "./empireData.types";

export interface OddsRequest extends EmpireData {}
  
export interface OddsResponse {
    success: boolean;
    odds: number;
}