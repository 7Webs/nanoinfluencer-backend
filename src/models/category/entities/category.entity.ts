import { BaseClassEntity } from 'src/common/entities/base.extend-entity';
import { slugify } from 'src/common/utils/slugify';
import { Deal } from 'src/models/deals/entities/deal.entity';
import { Shop } from 'src/models/shop/entities/shop.entity';
import { User } from 'src/models/user/entities/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  JoinTable,
  ManyToMany,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';

@Entity('category')
export class Category extends BaseClassEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column()
  description: string;

  @Column()
  image: string;

  @ManyToOne(() => Category, (category) => category.children, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  parent: Category;

  @OneToMany(() => Category, (category) => category.parent)
  children: Category[];

  @OneToMany(() => Shop, (shop) => shop.category)
  shops: Shop[];

  @OneToMany(() => User, (u) => u.category)
  users: User[];

  @OneToMany(() => Deal, (deal) => deal.category)
  deals: Deal[];

  @ManyToMany(() => Category, { cascade: true })
  @JoinTable({
    name: 'related_categories',
    joinColumn: { name: 'category_id', referencedColumnName: 'id' },
    inverseJoinColumn: {
      name: 'related_category_id',
      referencedColumnName: 'id',
    },
  })
  relatedCategories: Category[];

  // Auto-generate slug before saving
  @BeforeInsert()
  @BeforeUpdate()
  async generateSlug() {
    if (!this.slug || this.name) {
      const baseSlug = slugify(this.name); // Convert name to slug
      this.slug = await this.ensureUniqueSlug(baseSlug);
    }
  }

  private async ensureUniqueSlug(
    baseSlug: string,
    suffix: number = 0,
  ): Promise<string> {
    const repository = Category.getRepository(); // Access the repository
    const slug = suffix > 0 ? `${baseSlug}-${suffix}` : baseSlug;

    // Check if slug already exists
    const existingCategory = await repository.findOne({ where: { slug } });
    if (existingCategory) {
      // Recursively generate a new slug with incremented suffix
      return this.ensureUniqueSlug(baseSlug, suffix + 1);
    }

    return slug;
  }
}
