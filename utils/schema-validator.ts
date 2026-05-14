import fs from 'fs/promises';
import path from 'path';
import Ajv from 'ajv';
import { createSchema } from 'genson-js';

const ajv = new Ajv({ allErrors: true });
const schema_base_path = './response-schemas';

export async function validateSchema(
    dirName: string,
    fileName: string,
    responseBody: unknown,
    createSchemaFlag: boolean = false
): Promise<void> {
    const schemaPath = path.join(schema_base_path, dirName, `${fileName}-schema.json`);
    if(createSchemaFlag) await generateNewSchema(responseBody as object, schemaPath);

     
    const schema = await loadSchema(schemaPath);
    const validate = ajv.compile(schema);

    const valid = validate(responseBody);
    if (!valid) {
        const detail = JSON.stringify(validate.errors, null, 2);
        console.error(`[schema-validator] ${dirName}/${fileName}-schema.json failed:\n${detail}`);
        throw new Error(
            `schema validation ${fileName}-schema.json failed:\n` +
                `${detail}\n\n` +
                `Actual response body:\n` +
                `${JSON.stringify(responseBody, null, 2)}`,
        );
    }
}

async function loadSchema(schemaPath: string) {
    try {
        const schemaContent = await fs.readFile(schemaPath, 'utf8');
        return JSON.parse(schemaContent);
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        throw new Error(`Failed to read schema file: ${msg}`);
    }
}
async function generateNewSchema(responseBody:object, schemaPath:string) {
    try {
        const generatedSchema = createSchema(responseBody);
        await fs.mkdir(path.dirname(schemaPath),{ recursive: true });
        await fs.writeFile(schemaPath, JSON.stringify(generatedSchema, null, 4));
    } catch (error) {
        throw new Error(`Failed to create schema file: ${error.message}`);
        
    }
}