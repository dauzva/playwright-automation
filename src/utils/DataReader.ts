import * as fs from 'fs';
import * as path from 'path';

/**
 * DataReader – utility to load test data from JSON and CSV files.
 * Used for data-driven testing in Exercise 4.
 */
export class DataReader {
  /** Read and parse a JSON test-data file */
  static readJSON<T = Record<string, unknown>>(relativeFilePath: string): T {
    const absolutePath = path.resolve(process.cwd(), relativeFilePath);
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Test data file not found: ${absolutePath}`);
    }
    const raw = fs.readFileSync(absolutePath, 'utf-8');
    return JSON.parse(raw) as T;
  }

  /**
   * Read a CSV file and parse it into an array of objects.
   * The first row is treated as column headers.
   */
  static readCSV(relativeFilePath: string): Record<string, string>[] {
    const absolutePath = path.resolve(process.cwd(), relativeFilePath);
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Test data file not found: ${absolutePath}`);
    }

    const raw = fs.readFileSync(absolutePath, 'utf-8');
    const lines = raw
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map((h) => h.trim());
    const rows: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim());
      const row: Record<string, string> = {};
      headers.forEach((header, idx) => {
        row[header] = values[idx] ?? '';
      });
      rows.push(row);
    }

    return rows;
  }

  /** Load the main test-data.json file */
  static loadTestData(): TestData {
    return DataReader.readJSON<TestData>('test-data/test-data.json');
  }

  /** Load users from the CSV file */
  static loadUsersFromCSV(): CSVUser[] {
    const rows = DataReader.readCSV('test-data/users.csv');
    return rows.map((r) => ({
      id:         r['id'],
      firstName:  r['firstName'],
      lastName:   r['lastName'],
      email:      r['email'],
      password:   r['password'],
      gender:     r['gender'] as 'Male' | 'Female',
      company:    r['company'],
    }));
  }
}

// ─── Type definitions for test-data.json ──────────────────────────────────────

export interface TestUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  gender: string;
  company: string;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  country: string;
  countryId: string;
  state: string;
  city: string;
  address1: string;
  address2: string;
  zip: string;
  phone: string;
}

export interface WebTableRow {
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  salary: number;
  department: string;
}

export interface TestData {
  users: TestUser[];
  shippingAddress: ShippingAddress;
  priceThreshold: number;
  categories: string[];
  webTableRows: WebTableRow[];
}

export interface CSVUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  gender: 'Male' | 'Female';
  company: string;
}
