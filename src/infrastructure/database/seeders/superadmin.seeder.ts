import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserRole } from 'src/core/enums/user-role.enum';
import { User } from 'src/core/entities/user.entity';

export async function seedSuperAdmin(userRepo: Repository<User>) {
  const exists = await userRepo.findOne({ where: { role: UserRole.SUPER_ADMIN } });

  if (!exists) {
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;
    if (!superAdminPassword) {
      throw new Error('SUPER_ADMIN_PASSWORD environment variable is not set');
    }
    const user = userRepo.create({
      email: process.env.SUPER_ADMIN_EMAIL,
      password: await bcrypt.hash(superAdminPassword, 10),
      role: UserRole.SUPER_ADMIN,
      isVerified: true,
    });
    await userRepo.save(user);
    console.log('Super Admin created');
  } else {
    console.log('ℹSuper Admin already exists');
  }
}
