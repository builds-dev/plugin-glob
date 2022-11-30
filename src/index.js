import { dirname } from 'node:path'
import fast_glob from 'fast-glob'

export const virtual_module_id_prefix = 'virtual:glob:'

export const create_module_for_glob = async ({ glob, importer }) => {
	const files = await fast_glob(glob, { cwd: dirname(importer) })
	return [
		...files.map((file, index) => `import * as _${index} from '${file}'`),
		`export default {`,
		files.map((file, index) => `  '${file}': _${index}`).join(',\n'),
		`}`
	]
		.join('\n')
}
