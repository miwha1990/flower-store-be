import { UserType } from '@prisma/client';

export class CurrentUser {
	id: string;
	createdAt: Date;
	updatedAt: Date;
	name: string;
	email: string;
	phone: string | null;
	type: UserType | null;
	constructor(partial: Partial<CurrentUser>) {
		this.createdAt = partial.createdAt;
		this.updatedAt = partial.updatedAt;
		this.name = partial.name;
		this.email = partial.email;
		this.phone = partial.phone;
		this.type = partial.type;
		this.id = partial.id;
	}
}

export class NewUser extends CurrentUser {
	password: string;
	constructor(partial: Partial<NewUser>) {
		super(partial);
		this.password = partial.password;
	}
}

export class AuthEntity {
	accessToken: string;
	user: CurrentUser;
}
