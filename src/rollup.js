import { basename, dirname } from 'node:path'
import pkg from '../package.json' assert { type: 'json' }
import {
	create_module_for_glob,
	virtual_module_id_prefix
} from './index.js'

const name = pkg.name
const meta = Symbol()

export const import_glob = () => {
	return {
		name,
		resolveId (source, importer, options) {
			return source.startsWith(virtual_module_id_prefix)
				?
					{
						/*
							All that matters here is that the id is unique and has the same directory as the importer.
						*/
						// id: `${dirname(importer)}/${ulid()}.js`
						id: `${dirname(importer)}/${virtual_module_id_prefix}${basename(importer)}`,
						meta: { [meta]: { source, importer, options } }
					}
				:
					null
		},
		async load (id) {
			const module_info = this.getModuleInfo(id)
			if (module_info.meta[meta]) {
				const { source, importer, options } = module_info.meta[meta]
				const glob = source.slice(virtual_module_id_prefix.length)
				const code = await create_module_for_glob({ glob, importer })
				return { code }
			}
			return null
		}
	}
}
