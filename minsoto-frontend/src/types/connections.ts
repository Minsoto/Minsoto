// Types for Organizations & Connections (Phase 2A)

export interface UserMinimal {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    profile_picture_url: string;
}

export interface Organization {
    id: string;
    name: string;
    domain: string;
    logo_url: string;
    org_type: 'college' | 'company' | 'school' | 'community' | 'other';
    description: string;
    is_verified: boolean;
    website: string;
    location: string;
    member_count: number;
    created_at: string;
}

export interface OrganizationMembership {
    id: string;
    user: UserMinimal;
    organization: Organization;
    verification_status: 'pending' | 'verified' | 'rejected';
    role: 'member' | 'admin' | 'moderator';
    is_primary: boolean;
    is_visible: boolean;
    show_on_profile: boolean;
    joined_at: string;
}

export interface OrganizationMember {
    id: string;
    user: UserMinimal;
    role: string;
    joined_at: string;
    interests: string[];
}

export interface OrganizationDetail extends Organization {
    members: OrganizationMember[];
}

export interface Connection {
    id: string;
    from_user: UserMinimal;
    to_user: UserMinimal;
    status: 'pending' | 'accepted' | 'rejected';
    connection_type: 'connection' | 'friend';
    message: string;
    friend_upgrade_requested_by?: string;  // User ID who requested upgrade
    friend_upgrade_requested_at?: string;
    created_at: string;
    updated_at: string;
}

export type ConnectionStatus =
    | 'none'
    | 'pending_sent'
    | 'pending_received'
    | 'connected'
    | 'friends';

export interface DiscoverUser extends UserMinimal {
    connection_status: ConnectionStatus;
    interests: string[];
    organizations: string[];
}
