import type {API, Endpoints, Id} from '../rest/index.ts';
import {Request} from '../util/fetch.ts';
import {sdk} from './create.ts';
import type {PossibleWebhookIDs} from '../util/types.ts';

/**
 * Projects SDK client
 * @public
 */
export const projects = sdk(client => {
	const tokens = {
		/**
		 * Deletes a project token by its ID
		 *
		 * @param projectTokenId - The ID of the project token to delete
		 */
		async delete(projectTokenId: Id<'ptkid'>, project?: Id<'project'>) {
			if (client.authType !== 'ptk' && !project) {
				throw new Error(
					'Project ID is required for bearer or PAT authentication to delete a project token',
				);
			}

			await client.delete(
				project
					? '/v1/projects/:project_id/tokens/:project_token_id'
					: '/v1/projects/@this/tokens/:project_token_id',
				undefined,
				project
					? {project_id: project, project_token_id: projectTokenId}
					: {project_token_id: projectTokenId},
			);
		},

		/**
		 * Get all project tokens for a project
		 *
		 * @param projectId - The project to fetch secrets for
		 * @returns An array of all secrets for the project
		 */
		async get(projectId?: Id<'project'>) {
			if (client.authType !== 'ptk' && !projectId) {
				throw new Error(
					'Project ID is required for bearer or PAT authentication',
				);
			}

			if (!projectId) {
				const {project_tokens: keys} = await client.get(
					'/v1/projects/@this/tokens',
					{},
				);

				return keys;
			}

			const {project_tokens: keys} = await client.get(
				'/v1/projects/:project_id/tokens',
				{project_id: projectId},
			);

			return keys;
		},

		/**
		 * Creates a new project token
		 *
		 * @param projectId - The project to create a key for
		 * @param flags - Permissions for this flag
		 * @returns A newly created project token
		 */
		async create(flags: number, projectId?: Id<'project'>) {
			if (!projectId && client.authType !== 'ptk') {
				throw new Error(
					'Project ID is required for bearer or PAT authentication to create a project token',
				);
			}

			if (!projectId) {
				const {project_token: token} = await client.post(
					'/v1/projects/@this/tokens',
					{flags},
					{},
				);

				return token;
			}

			const {project_token: token} = await client.post(
				'/v1/projects/:project_id/tokens',
				{flags},
				{project_id: projectId},
			);

			return token;
		},
	};

	const webhooks = {
		async get(projectId?: Id<'project'>) {
			if (client.authType !== 'ptk' && !projectId) {
				throw new Error(
					'Project ID is required for bearer or PAT authentication to fetch all project members',
				);
			}

			if (projectId) {
				const {webhooks} = await client.get(
					'/v1/projects/:project_id/webhooks',
					{
						project_id: projectId,
					},
				);

				return webhooks;
			}

			const {webhooks} = await client.get('/v1/projects/@this/webhooks', {});

			return webhooks;
		},

		async create(
			webhook_url: string,
			events: PossibleWebhookIDs[],
			projectId?: Id<'project'>,
		) {
			if (client.authType !== 'ptk' && !projectId) {
				throw new Error(
					'Project ID is required for bearer or PAT authentication to create a webhook',
				);
			}

			if (projectId) {
				const {webhook} = await client.post(
					'/v1/projects/:project_id/webhooks',
					{
						webhook_url,
						events,
					},
					{
						project_id: projectId,
					},
				);

				return webhook;
			}

			const {webhook} = await client.post(
				'/v1/projects/@this/webhooks',
				{
					webhook_url,
					events,
				},
				{},
			);

			return webhook;
		},

		async edit(
			webhookId: Id<'webhook'>,
			{
				events,
				webhookUrl,
			}: {
				webhookUrl: string | undefined;
				events: PossibleWebhookIDs[] | undefined;
			},
			projectId?: Id<'project'>,
		) {
			if (client.authType !== 'ptk' && !projectId) {
				throw new Error(
					'Project ID is required for bearer or PAT authentication to edit a webhook',
				);
			}

			if (projectId) {
				const {webhook} = await client.patch(
					'/v1/projects/:project_id/webhooks/:webhook_id',
					{
						webhook_url: webhookUrl,
						events,
					},
					{
						project_id: projectId,
						webhook_id: webhookId,
					},
				);

				return webhook;
			}

			const {webhook} = await client.patch(
				'/v1/projects/@this/webhooks/:webhook_id',
				{
					webhook_url: webhookUrl,
					events,
				},
				{
					webhook_id: webhookId,
				},
			);

			return webhook;
		},

		async delete(webhookId: Id<'webhook'>, projectId?: Id<'project'>) {
			if (client.authType !== 'ptk' && !projectId) {
				throw new Error(
					'Project ID is required for bearer or PAT authentication to delete a webhook',
				);
			}

			if (projectId) {
				await client.delete(
					'/v1/projects/:project_id/webhooks/:webhook_id',
					undefined,
					{
						project_id: projectId,
						webhook_id: webhookId,
					},
				);

				return;
			}

			await client.delete(
				'/v1/projects/@this/webhooks/:webhook_id',
				undefined,
				{
					webhook_id: webhookId,
				},
			);
		},

		async regenerateSecret(
			webhookId: Id<'webhook'>,
			projectId?: Id<'project'>,
		) {
			if (client.authType !== 'ptk' && !projectId) {
				throw new Error(
					'Project ID is required for bearer or PAT authentication to regenerate a webhook secret',
				);
			}

			if (projectId) {
				const {secret} = await client.post(
					'/v1/projects/:project_id/webhooks/:webhook_id/regenerate',
					undefined,
					{
						project_id: projectId,
						webhook_id: webhookId,
					},
				);

				return secret;
			}

			const {secret} = await client.post(
				'/v1/projects/@this/webhooks/:webhook_id/regenerate',
				undefined,
				{
					webhook_id: webhookId,
				},
			);

			return secret;
		},
	};

	const projectsSDK = {
		async getAllMembers(projectId?: Id<'project'>) {
			if (client.authType !== 'ptk' && !projectId) {
				throw new Error(
					'Project ID is required for bearer or PAT authentication to fetch all project members',
				);
			}

			if (projectId) {
				const {members} = await client.get('/v1/projects/:project_id/members', {
					project_id: projectId,
				});

				return members;
			}

			const {members} = await client.get('/v1/projects/@this/members', {});

			return members;
		},

		/**
		 * Fetch the currently authorized member from a project.
		 * You cannot use this route if you are authorizing with a project token as there is no user attached to it.
		 *
		 * @param projectId - The project ID to fetch a member from
		 * @returns The member authorized by the SDK
		 */
		async getCurrentMember(projectId: Id<'project'>) {
			if (client.authType === 'ptk') {
				throw new Error(
					'You cannot resolve a member from a project token! You must use a bearer or pat token',
				);
			}

			const {project_member: member} = await client.get(
				'/v1/projects/:project_id/members/@me',
				{project_id: projectId},
			);

			return member;
		},

		/**
		 * @deprecated Use {@link projectsSDK.tokens} instead
		 */
		projectTokens: tokens,

		tokens,

		webhooks,

		secrets: {
			/**
			 * Gets all secrets in a project
			 *
			 * @param projectId - The project to fetch secrets for
			 */
			async getAll(projectId?: Id<'project'>) {
				if (client.authType !== 'ptk' && !projectId) {
					throw new Error(
						'Project ID is required for bearer or PAT authentication to fetch all secrets',
					);
				}

				if (!projectId) {
					const {secrets} = await client.get('/v1/projects/@this/secrets', {});

					return secrets;
				}

				const {secrets} = await client.get('/v1/projects/:project_id/secrets', {
					project_id: projectId,
				});

				return secrets;
			},

			/**
			 * Creates a new project secret
			 *
			 * @param name - The name of the secret
			 * @param value - The value of the secret
			 * @param projectId - The project to create the secret in
			 */
			async create(name: string, value: string, projectId?: Id<'project'>) {
				if (client.authType !== 'ptk' && !projectId) {
					throw new Error(
						'Project ID is required for bearer or PAT authentication to create a secret',
					);
				}

				const url = client.url('/v1/projects/@this/secrets/:name', {
					name,
					project: projectId,
				});

				const request = new Request(url, {
					headers: {
						'Content-Type': 'text/plain',
					},
					body: value,
					method: 'PUT',
				});

				const {secret} = await client.raw<
					Extract<
						Endpoints,
						{method: 'PUT'; path: '/v1/projects/@this/secrets/:name'}
					>['res']
				>(request);

				return secret;
			},

			/**
			 * Deletes a secret from a project
			 *
			 * @param id - The secret ID to delete
			 * @param projectId - The project to delete the secret from
			 */
			async delete(
				id: Id<'secret'> | API.Projects.Secret['name'],
				projectId?: Id<'project'>,
			) {
				if (client.authType !== 'ptk' && !projectId) {
					throw new Error(
						'Project ID is required for bearer or PAT authentication to delete a secret',
					);
				}

				if (!projectId) {
					await client.delete(
						'/v1/projects/@this/secrets/:secret_id',
						undefined,
						{
							secret_id: id,
						},
					);

					return;
				}

				await client.delete(
					'/v1/projects/:project_id/secrets/:secret_id',
					undefined,
					{secret_id: id, project_id: projectId},
				);
			},
		},
	};

	return projectsSDK;
});
