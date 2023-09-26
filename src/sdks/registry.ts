import type {Id} from '../rest/index.ts';
import {sdk} from './create.ts';

/**
 * Registry SDK client
 * @public
 */
export const registry = sdk(client => {
	return {
		images: {
			async getAll(project?: Id<'project'>) {
				if (!project && client.authType !== 'ptk') {
					throw new Error('Project is required when using a PAT or bearer');
				}

				const {images} = await client.get('/v1/registry/images', {
					project,
				});

				return images;
			},

			async getManifest(image: string, project?: Id<'project'>) {
				if (!project && client.authType !== 'ptk') {
					throw new Error('Project is required when using a PAT or bearer');
				}

				const {manifests} = await client.get(
					'/v1/registry/images/:image/manifests',
					{image, project},
				);

				return manifests;
			},

			async delete(image: string, project?: Id<'project'>) {
				if (!project && client.authType !== 'ptk') {
					throw new Error('Project is required when using a PAT or bearer');
				}

				await client.delete('/v1/registry/images/:image', undefined, {
					image,
					project,
				});
			},
		},
	};
});
