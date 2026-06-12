import { parseCsvFromUrl } from './parser';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

// Use __dirname directly as it's CJS
// If it's being compiled from TS to CJS, we can just use path.resolve
const fixturePath = path.resolve(__dirname, 'fixtures', 'example.csv');

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Payroll Parser', () => {
  it('should parse CSV correctly and normalize numbers', async () => {
    const csvContent = fs.readFileSync(fixturePath);
    
    // Mock axios response stream
    const { Readable } = require('stream');
    const stream = Readable.from(csvContent);
    
    // Mock both calls (metadata and data)
    mockedAxios.get.mockResolvedValueOnce({ data: 'CUIT: 30-62636962-2, Período 05 2026\n' });
    mockedAxios.get.mockResolvedValueOnce({ data: stream });

    const result = await parseCsvFromUrl('http://fake-url.com/test.csv');

    expect(result.metadata.cuit).toBe('30-62636962-2');
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0]).toEqual({
      'CUIL': '20-12345678-9',
      'Nombre': 'JUAN PEREZ',
      'Sueldo Bruto': 1500000.50,
      'Retenciones': 255000.00,
      'Neto': 1245000.50
    });
    expect(result.rows[1]['Nombre']).toBe('MARIA GARCIA');
    expect(result.rows[1]['Sueldo Bruto']).toBe(2100000);
  });
});
