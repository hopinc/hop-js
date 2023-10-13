import type {ByteSizeString} from '../../util/index.ts';
import type {
	Empty,
	HopShDomain,
	Id,
	InternalHopDomain,
	MakeOptional,
	Timestamp,
} from '../../util/types.ts';
import type {Endpoint} from '../endpoints.ts';

/**
 * All regions that Hop operates in
 * @public
 */
export enum Regions {
	US_EAST_1 = 'us-east-1',
}

/**
 * Runtime types are used to describe the type of a deployment or container
 * @public
 */
export enum RuntimeType {
	/**
	 * Ephemeral deployments/containers are sort of fire and forget. Containers won't restart if they exit but they can still be terminated programatically.
	 */
	EPHEMERAL = 'ephemeral',

	/**
	 * Persistent deployments/containers will restart if they exit. They can also be started and stopped programmatically.
	 */
	PERSISTENT = 'persistent',

	/**
	 * Stateful deployments/containers can only run one container at a time, and will have a persistent volume attached.
	 */
	STATEFUL = 'stateful',
}

/**
 * An enum of states a container can be in
 * @public
 */
export enum ContainerState {
	/**
	 * The container is pending creation
	 */
	PENDING = 'pending',

	/**
	 * The container is running
	 */
	RUNNING = 'running',

	/**
	 * The container is stopped
	 */
	STOPPED = 'stopped',

	/**
	 * The container's entrypoint failed (e.g. exited with a non-zero exit code)
	 */
	FAILED = 'failed',

	/**
	 * The container is being deleted
	 */
	TERMINATING = 'terminating',

	/**
	 * The container exited (e.g. with a zero exit code)
	 */
	EXITED = 'exited',
}

/**
 * Rollout state for deployments
 * @public
 */
export enum RolloutState {
	PENDING = 'pending',
	FINISHED = 'finished',
	FAILED = 'failed',
}

/**
 * Restart policy for deployments
 * @public
 */
export enum RestartPolicy {
	NEVER = 'never',
	ALWAYS = 'always',
	ON_FAILURE = 'on-failure',
}

/**
 * Types for supported GPU
 * @public
 */
export enum VgpuType {
	A400 = 'a400',
}

/**
 * Formats of volumes
 * @public
 */
export enum VolumeFormat {
	EXT4 = 'ext4',
	XFS = 'xfs',
}

/**
 * A definition of a volume
 * @public
 */
export interface VolumeDefinition {
	/**
	 * The format of the volume
	 */
	fs: VolumeFormat;

	/**
	 * The size of the volume in bytes
	 */
	size: ByteSizeString;

	/**
	 * The mount point of the volume
	 */
	mount_path: string;
}

export interface ContainerMetrics {
	cpu_usage_percent: number;
	memory_usage_percent: number;
	memory_usage_bytes: number;
}

/**
 * The definition of a container
 * @public
 */
export interface Container {
	/**
	 * The ID of the container
	 */
	id: Id<'container'>;

	/**
	 * The time this container was created
	 */
	created_at: Timestamp;

	/**
	 * The region this container runs in
	 */
	region: Regions;

	/**
	 * Information about uptime/downtime for this container
	 */
	uptime: {
		/**
		 * The last time this container was started at
		 */
		last_start: Timestamp;
	};

	/**
	 * Metrics for this container
	 */
	metrics: ContainerMetrics | null;

	/**
	 * Information about the container
	 */
	metadata: {
		/**
		 * The last exit code
		 */
		last_exit_code?: number;
	};

	/**
	 * Overrides that were provided manually to the container
	 */

	overrides: {
		resources?: Partial<Resources>;
	} | null;

	/**
	 * The type of this container
	 */
	type: RuntimeType;

	/**
	 * The volume definition for this container
	 */
	volume: VolumeDefinition | null;

	/**
	 * The internal IP of the container
	 */
	internal_ip: string;

	/**
	 * The ID of the deployment this container is associated with
	 */
	deployment_id: Id<'deployment'>;

	/**
	 * The state this container is in
	 */
	state: ContainerState;
}

/**
 * A definition of a deployment
 * @public
 */
export interface Deployment {
	/**
	 * The ID of the deployment
	 */
	id: Id<'deployment'>;

	/**
	 * The name of the deployment
	 */
	name: string;

	/**
	 * The amount of containers this deployment is currently running
	 */
	container_count: number;

	/**
	 * The time this deployment was created at
	 */
	created_at: Timestamp;

	/**
	 * The config for this deployment
	 */
	config: Omit<DeploymentConfig, 'name'>;

	/**
	 * Current active rollout for deployment
	 * @deprecated Use {@link Deployment.latest_rollout} instead
	 */
	active_rollout: DeploymentRollout | null;

	/**
	 * Current active build for deployment
	 */
	active_build: Build | null;

	/**
	 * The ID of the build currently being used in production by this deployment.
	 * This will change if another build has been promoted to production.
	 */
	build_id: Build['id'] | null;

	/**
	 * Current active rollout for deployment
	 */
	latest_rollout: DeploymentRollout | null;

	/**
	 * The amount of containers in the running state
	 */
	running_container_count: number;

	/**
	 * The target amount of containers a deployment should run
	 */
	target_container_count: number;

	/**
	 * Metadata for deployment
	 */
	metadata: DeploymentMetadata | null;

	/**
	 * Build cache settings for deployment
	 */
	build_cache_enabled: boolean;

	/**
	 * Build settings for deployment
	 */
	build_settings?: BuildSettings;

	/**
	 * The group the deployment belongs in
	 */
	group_id: Id<'deployment_group'> | null;
}

/**
 * A definition of a build's settings
 * @public
 */
export interface BuildSettings {
	/**
	 * Root directory for build
	 */
	root_directory?: string;

	/**
	 * Specifies where the dockerfile is located
	 */
	dockerfile?: string;
}

/**
 * Deployment metadata
 * @public
 */
export interface DeploymentMetadata {
	container_port_mappings: Record<Id<'container'>, string[]>;
	ignored_boarding?: boolean;
	created_from_preset?: string;
	created_first_gateway?: boolean;
}

/**
 * Deployment metadata
 * @deprecated Use {@link DeploymentMetadata} instead
 * @public
 */
export type DeploymentMetaData = DeploymentMetadata;

/**
 * Metadata attached to a build
 * @public
 */
export interface BuildMetadata {
	/**
	 * Account type of repo owner
	 */
	account_type?: 'user' | 'organization';

	/**
	 * Author information about build
	 */
	author?: {
		/**
		 * Author's Pfp
		 */
		avatar_url: string;

		/**
		 * Author's username
		 */
		username: string;
	};

	/**
	 * Repo ID for build
	 */
	repo_id: number;

	/**
	 * Repo name for build
	 */
	repo_name: string;

	/**
	 * Repo branch for build
	 */
	branch: string;

	/**
	 * commit SHA for build
	 */
	commit_sha: string;

	/**
	 * commit message for build
	 */
	commit_msg: string;

	/**
	 * commit URL for build
	 */
	commit_url?: string;
}

/**
 * Metadata attached to a build
 * @deprecated Use {@link BuildMetadata} instead
 * @public
 */
export type BuildMetaData = BuildMetadata;

/**
 * The inferred environment type of a build
 * @public
 */
export enum BuildEnvironmentType {
	NIXPACKS = 'nixpacks',
	DOCKERFILE = 'dockerfile',
}

/**
 * The validated nixpacks plan for this build
 * @public
 */
export interface NixPlan {
	language: string | null;
	pkgs: string[] | null;
	cmds: {
		build: string | null;
		start: string | null;
		install: string | null;
	};
}

/**
 * Build environment contians information about the
 * language and build commands used to build the deployment
 * @public
 */
export interface BuildEnvironment {
	type: BuildEnvironmentType;
	nix_plan?: NixPlan | null;
}

/**
 * Why the uploaded build content was rejected
 * @public
 */
export interface ValidationFailure {
	reason: string;
	help_link: string | null;
}

/**
 * A build is a single build of a deployment
 * @public
 */
export interface Build {
	/**
	 * ID of the build
	 */
	id: Id<'build'>;

	/**
	 * Deployment ID for build
	 */
	deployment_id: Id<'deployment'>;

	/**
	 * Metadata pertaining to build (mostly for GitHub)
	 */
	metadata: BuildMetadata | null;

	/**
	 * Build method (GitHub or CLI)
	 */
	method: BuildMethod;

	/**
	 * Timestamp of when the build was created/queued
	 */
	created_at?: Timestamp;

	/**
	 * Timestamp of when the build has started
	 */
	started_at: Timestamp | null;

	/**
	 * Timestamp of when the build has finished
	 */
	finished_at: Timestamp | null;

	/**
	 * Digest for image
	 */
	digest: string | null;

	/**
	 * State of the build
	 */
	state: BuildState;

	/**
	 * Environment for build
	 */
	environment: BuildEnvironment | null;

	/**
	 * Validation failure for build; present if build state is VALIDATION_FAILED
	 */
	validation_failure: ValidationFailure | null;
}

/**
 * Information about a deployment's health check configuration
 * @public
 */
export type HealthCheck = {
	/**
	 * The ID of health check
	 */
	id: Id<'health_check'>;

	/**
	 * Protocol for health check
	 */
	protocol: 'http';

	/**
	 * Path for health check
	 */
	path: string;

	/**
	 * Port for health check
	 */
	port: number;

	/**
	 * Interval for health check. This is how often the health check will be performed in seconds
	 */
	interval: number;

	/**
	 * How long to wait for a response before considering the health check failed in milliseconds
	 */
	timeout: number;

	/**
	 * How long we should wait when the container starts before performing the first health check.
	 * This is useful for containers that take a while to start up, for example when running migrations.
	 * This value is in seconds
	 */
	initial_delay: number;

	/**
	 * Maximum number of consecutive failures before the container is considered unhealthy
	 */
	max_retries: number;

	/**
	 * When the health check was created
	 */
	created_at: Timestamp;
};

export type Group = {
	/**
	 * The ID of the group
	 */
	id: Id<'deployment_group'>;
	/**
	 * The name of the group
	 */
	name: string;
	/**
	 * The ID of the project the group belongs to
	 */
	project_id: Id<'project'>;
	/**
	 * The position of the group in the list
	 */
	position: number;
	/**
	 * The date the group was created
	 */
	created_at: Timestamp;
};

/**
 * A deployment rollout
 * @public
 */
export type DeploymentRollout = {
	/**
	 * The rollout ID for rollout
	 */
	id: Id<'rollout'>;

	/**
	 * The deployment ID for rollout
	 */
	deployment_id: Id<'deployment'>;

	/**
	 * How many containers are being recreated
	 */
	count: number;

	/**
	 * When the rollout took place
	 */
	created_at: Timestamp;
	/**
	 * The state of the rollout
	 */
	state: RolloutState;

	/**
	 * The build that triggered the rollout
	 */
	build: Build | null;

	/**
	 * Container ID that the rollout is pertaining to
	 */
	init_container_id: string | null;

	/**
	 * If a health check failed (causing the rollout to fail)
	 */
	health_check_failed: boolean;

	/**
	 * Last time latest rollout was updated
	 */
	last_updated_at: Timestamp;

	/**
	 * Has the rollout been acknowledged by a user
	 */
	acknowledged: boolean;
};

/**
 * Data required to create a deployment
 * @internal
 */
export type CreateDeploymentConfig = MakeOptional<DeploymentConfig, 'cmd'>;

/**
 * The strategy for scaling multiple containers.
 * @public
 */
export enum ContainerStrategy {
	/**
	 * Add containers yourself with the API or Console
	 */
	MANUAL = 'manual',

	/**
	 * Have Hop automatically scale containers based on load
	 */
	// AUTOSCALE = 'autoscale',
}

/**
 * A deployment's config
 * @public
 */
export interface DeploymentConfig {
	/**
	 * The name of the deployment
	 */
	name: string;

	/**
	 * The strategy for scaling multiple containers.
	 */
	container_strategy: ContainerStrategy;

	/**
	 * The type of this deployment
	 */
	type: RuntimeType;

	/**
	 * The version of this config
	 */
	version: '12-12-2022';

	/**
	 * Entrypoint command for the image
	 */
	cmd?: string[];

	/**
	 * The docker image config for this deployment
	 */
	image: Image;

	/**
	 * Environment variables for this deployment
	 */
	env: Record<string, string>;

	/**
	 * Resources allocated to this deployment
	 */
	resources: Resources;

	/**
	 * Restart policy for this deployment
	 */
	restart_policy: RestartPolicy;

	/**
	 * The volume definition for this deployment
	 *
	 * This can only be used when .type is 'stateful'
	 */
	volume?: VolumeDefinition;

	/**
	 * Entrypoint for this deployment
	 */
	entrypoint?: string[];
}

/**
 * Docker image config
 * @public
 */
export interface Image {
	/**
	 * The name of the docker image
	 */
	name: string | null;

	/**
	 * Authorization required for the registry to access this image
	 * This is not required if you use Hop's own registry.
	 */
	auth: Auth | null;

	/**
	 * GitHub repo information (if applicable)
	 */
	gh_repo: ImageGHRepo | null;
}

/**
 * Docker image registry authorization
 * @public
 */
export interface Auth {
	username: string;
	password: string;
}

/**
 * GitHub repo type sent from API (NOT USED IN IMAGES)
 * @public
 */
export interface GHRepo {
	id: number;
	full_name: string;
	private: boolean;
	default_branch: string;
	account_name: string;
}

/**
 * GitHub repo partial used for images
 * @public
 */
export interface ImageGHRepo {
	repo_id: number;
	full_name: string;
	branch: string;
}

/**
 * Resources allocated to a deployment
 * @public
 */
export interface Resources {
	/**
	 * Amount of vCPU to allocate
	 */
	vcpu: number;

	/**
	 * Amount of memory to allocate in a readible format
	 * You can use the `parseSize` function to convert this to bytes.
	 */
	ram: ByteSizeString;

	/**
	 * vGPUs to allocate
	 */
	vgpu: Vgpu[];
}

/**
 * Virtual GPU config
 * @public
 */
export interface Vgpu {
	/**
	 * The type of vGPU to allocate
	 */
	type: VgpuType;

	/**
	 * The amount of vGPUs to allocate
	 */
	count: number;
}

/**
 * Logs from a container
 * @public
 */
export interface ContainerLog {
	/**
	 * The timestamp of the log
	 */
	timestamp: Timestamp;

	/**
	 * The log message
	 */
	message: string;

	/**
	 * The ID of the document in elasticsearch. You probably won't have to use this, but
	 * it might be useful for React keys, for example, as they are unique.
	 */
	nonce: string;

	/**
	 * The level of the log
	 *
	 * ("error" and "log" are for backwards compatibility, new logs will be "stdout" and "stderr")
	 */
	level: 'stdout' | 'stderr' | 'error' | 'info';
}

/**
 * Types of build methods supported by Hop
 * @public
 */
export enum BuildMethod {
	GITHUB = 'github',
	CLI = 'cli',
}

/**
 * Types of gateways supported by Hop
 * @public
 */
export enum GatewayType {
	/**
	 * The gateway can only be accessed inside of a project's network
	 */
	INTERNAL = 'internal',

	/**
	 * The gateway can be accessed from the internet
	 */
	EXTERNAL = 'external',
}

/**
 * Gateways are used to connect services to the internet or a private network
 * @public
 */
export interface Gateway {
	/**
	 * The ID of the gateway
	 */
	id: Id<'gateway'>;

	/**
	 * The type of the gateway
	 */
	type: GatewayType;

	/**
	 * The name of the gateway
	 */
	name: string;

	/**
	 * The protocol for this gateway (Only for external)
	 *
	 * @alpha Currently, hop only supports HTTP. This will eventually change to an enum
	 */
	protocol: 'http' | null;

	/**
	 * The deployment this gateway is associated with
	 */
	deployment_id: Id<'deployment'>;

	/**
	 * The date this gateway was created
	 */
	created_at: Timestamp;

	/**
	 * Domain automatically assigned by Hop
	 */
	hopsh_domain: HopShDomain | null;

	/**
	 * Determines if the hop.sh domain is current active.
	 */
	hopsh_domain_enabled: boolean;

	/**
	 * Internal domain assigned by user upon gateway creation
	 */
	internal_domain: InternalHopDomain | null;

	/**
	 * Port the Gateway targets (Only for external gateways)
	 */
	target_port: number | null;

	/**
	 * Domains associated with this gateway
	 */
	domains: Domain[];
}

/**
 * An enum of states a domain can be in
 * @public
 */
export enum DomainState {
	PENDING = 'pending',
	VALID_CNAME = 'valid_cname',
	SSL_ACTIVE = 'ssl_active',
}

/**
 * An enum of states a build can be in
 * @public
 */
export enum BuildState {
	VALIDATING = 'validating',
	PENDING = 'pending',
	FAILED = 'failed',
	SUCCEEDED = 'succeeded',
	CANCELLED = 'cancelled',
	VALIDATION_FAILED = 'validation_failed',
}

/**
 * A domain is a DNS record that points to a gateway
 * @public
 */
export interface Domain {
	/**
	 * The ID of the domain
	 */
	id: Id<'domain'>;

	/**
	 * The domain name
	 */
	domain: string;

	/**
	 * The domain state
	 */
	state: DomainState;

	/**
	 * The date this domain was created
	 */
	created_at: Timestamp;

	/**
	 * Where the domain redirects to and its status code, null if N/A
	 */
	redirect: DomainRedirect | null;
}

/**
 * A redirect setup for a domain
 * @public
 */
export interface DomainRedirect {
	url: string;
	status_code: 301 | 302 | 307 | 308;
}

/**
 * All endpoints for the Ignite API
 * @public
 */
export type IgniteEndpoints =
	| Endpoint<
			'GET',
			'/v1/ignite/deployments',
			{deployments: Deployment[]; groups: Group[]}
	  >
	| Endpoint<
			'GET',
			'/v1/ignite/deployments/:deployment_id/containers',
			{containers: Container[]}
	  >
	| Endpoint<
			'POST',
			'/v1/ignite/deployments/:deployment_id/containers',
			{container: Container}
	  >
	| Endpoint<
			'POST',
			'/v1/ignite/deployments/:deployment_id/containers/:container_id',
			never,
			{
				/**
				 * The ID of the deployment
				 */
				deployment_id: Id<'deployment'>;

				/**
				 * The ID of the container
				 */
				container_id: Id<'container'>;
			}
	  >
	| Endpoint<
			'POST',
			'/v1/ignite/deployments',
			{deployment: Deployment},
			CreateDeploymentConfig
	  >
	| Endpoint<'DELETE', '/v1/ignite/deployments/:deployment_id', Empty>
	| Endpoint<
			'DELETE',
			'/v1/ignite/containers/:container_id',
			Empty | {container: Container}
	  >
	| Endpoint<
			'GET',
			'/v1/ignite/containers/:container_id/logs',
			{logs: ContainerLog[]}
	  >
	| Endpoint<'GET', '/v1/ignite/deployments/search', {deployment: Deployment}>
	| Endpoint<
			'GET',
			'/v1/ignite/deployments/:deployment_id',
			{deployment: Deployment}
	  >
	| Endpoint<
			'PUT',
			'/v1/ignite/containers/:container_id/state',
			Empty,
			{
				/**
				 * The state to update the container to
				 */
				preferred_state: ContainerState.STOPPED | ContainerState.RUNNING;
			}
	  >
	| Endpoint<
			'POST',
			'/v1/ignite/gateways/:gateway_id/domains',
			Empty,
			{domain: string}
	  >
	| Endpoint<'GET', '/v1/ignite/gateways/:gateway_id', {gateway: Gateway}>
	| Endpoint<
			'GET',
			'/v1/ignite/deployments/:deployment_id/gateways',
			{gateways: Gateway[]}
	  >
	| Endpoint<
			'POST',
			'/v1/ignite/deployments/:deployment_id/gateways',
			{gateway: Gateway},
			{
				type: GatewayType;
				target_port: number;
				protocol: Gateway['protocol'];
				name: string;
			}
	  >
	| Endpoint<
			'PATCH',
			'/v1/ignite/deployments/:deployment_id',
			{deployment: Deployment},
			Partial<DeploymentConfig>
	  >
	| Endpoint<
			'PATCH',
			'/v1/ignite/deployments/:deployment_id/metadata',
			{deployment: Deployment},
			Partial<DeploymentMetadata>
	  >
	| Endpoint<
			'POST',
			'/v1/ignite/deployments/:deployment_id/rollouts',
			{rollout: DeploymentRollout}
	  >
	| Endpoint<
			'POST',
			'/v1/ignite/deployments/:deployment_id/health-check',
			{health_check: HealthCheck},
			Omit<HealthCheck, 'id'>
	  >
	| Endpoint<
			'GET',
			'/v1/ignite/deployments/:deployment_id/storage',
			Record<
				'volume' | 'build_cache',
				Record<'provisioned_size' | 'used_size', number> | null
			>
	  >
	| Endpoint<
			'PATCH',
			'/v1/ignite/deployments/:deployment_id/health-check',
			{health_check: HealthCheck},
			Partial<Omit<HealthCheck, 'id'>>
	  >
	| Endpoint<'DELETE', '/v1/ignite/domains/:domain_id', Empty>
	| Endpoint<'GET', '/v1/ignite/domains/:domain_id', {domain: Domain}>
	| Endpoint<
			'POST',
			'/v1/ignite/groups',
			{group: Group},
			{
				name: string;
				deployment_ids: Id<'deployment'>[];
			}
	  >
	| Endpoint<
			'PATCH',
			'/v1/ignite/groups/:group_id',
			{group: Group},
			{
				name?: string | undefined;
				position?: number | undefined;
			}
	  >
	| Endpoint<
			'PUT',
			'/v1/ignite/groups/:group_id/deployments/:deployment_id',
			{group: Group}
	  >
	| Endpoint<'DELETE', '/v1/ignite/groups/:group_id', Empty>
  | Endpoint<"DELETE", "/v1/ignite/groups/:group_id/:deployment_id", Empty>
