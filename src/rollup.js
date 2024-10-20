import { basename, dirname, join as join_path } from 'node:path'
import { createHash } from 'node:crypto'
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
							Importers in different locations might use the same relative path,
							so the id returned here must disambiguate them.
						*/
						id: `${join_path(dirname(importer), createHash('sha256').update(source).digest('hex'))}.js`,
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
