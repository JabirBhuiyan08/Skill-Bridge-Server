import { prisma } from "../../lib/prisma";

export type CategoryData = {
  name: string;
  description: string;
  authorId?: string;
};

const uploadCategory = async (data: CategoryData) => {
  const category = await prisma.category.create({
    data: {
      name: data.name,
      description: data.description,
      authorId: data.authorId || '',
    },
    include: {
      subjects: true,
    },
  });
  return category;
};

const getAllCategories = async () => {
  const categories = await prisma.category.findMany({
    include: {
      subjects: true,
    },
  });
  return categories;
};

const updateCategory = async (id: string, data: Partial<CategoryData>) => {
  const category = await prisma.category.update({
    where: { id },
    data,
    include: {
      subjects: true,
    },
  });
  return category;
};

const deleteCategory = async (id: string) => {
  await prisma.category.delete({
    where: { id },
  });
  return { success: true };
};

export const categoryService = {
  uploadCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
};