import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit2, Tags } from 'lucide-react';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../lib/queries';
import { AVAILABLE_ICONS, getCategoryIcon } from '../lib/icons';
import { CategoryCardSkeleton } from '../components/Skeletons';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function Categories() {
  useDocumentTitle('Categories');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedIcon, setSelectedIcon] = useState('Tags');
  const [modalType, setModalType] = useState<'expense' | 'income'>('expense');
  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(data);
    } catch (error: any) {
      toast.error('Failed to load categories');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const name = form.categoryName.value;

    try {
      await createCategory({ name, type: modalType, icon: selectedIcon });
      toast.success('Category added successfully!');
      setIsModalOpen(false);
      loadCategories();
    } catch (error: any) {
      toast.error('Failed to add category');
      console.error(error);
    }
  };

  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const name = form.categoryName.value;

    if (!selectedCategory) return;

    try {
      await updateCategory(selectedCategory.id, { name, type: modalType, icon: selectedIcon });
      toast.success('Category updated successfully!');
      setIsEditModalOpen(false);
      loadCategories();
    } catch (error: any) {
      toast.error('Failed to update category');
      console.error(error);
    }
  };

  const executeDelete = async () => {
    if (!deleteId) return;
    try {
      setIsDeleting(true);
      await deleteCategory(deleteId);
      toast.success('Category deleted!');
      setDeleteId(null);
      loadCategories();
    } catch (error: any) {
      toast.error('Failed to delete category');
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const renderIcon = (iconName: string) => {
    const IconCmp = getCategoryIcon(iconName);
    return <IconCmp size={20} />;
  };

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Categories</h1>
          <p className="text-slate-500 font-medium mt-1">Manage your income and expense categories.</p>
        </div>
        <button 
          onClick={() => {
            setSelectedIcon('Tags');
            setModalType('expense');
            setIsModalOpen(true);
          }}
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 flex items-center gap-2 transition-all active:scale-95"
        >
          <Plus size={20} />
          <span className="hidden sm:inline">Add Category</span>
        </button>
      </div>

      <div className="flex bg-slate-100 p-1 rounded-2xl self-start">
        {['expense', 'income'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-8 py-2.5 rounded-xl font-bold text-sm transition-all capitalize ${
              activeTab === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab === 'expense' ? 'Pengeluaran' : 'Pemasukkan'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <CategoryCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.filter(c => c.type === activeTab).length === 0 ? (
            <div className="col-span-full bg-white rounded-[24px] p-12 text-center shadow-xl shadow-slate-200/40 border border-slate-100">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-500">
                <Tags size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">No Categories Found</h3>
              <p className="text-slate-500 max-w-sm mx-auto">
                Create categories to organize your transactions better.
              </p>
            </div>
          ) : (
            categories.filter(c => c.type === activeTab).map((category) => (
              <div key={category.id} className="glass-card rounded-[24px] p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer border-l-4 border-l-transparent hover:border-l-indigo-500">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    category.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                  }`}>
                    {renderIcon(category.icon)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-500 rounded-full capitalize">
                      {category.type}
                    </span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCategory(category);
                        setSelectedIcon(category.icon || 'Tags');
                        setModalType(category.type);
                        setIsEditModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:bg-indigo-100 hover:text-indigo-600 rounded-lg transition-colors"
                      title="Edit Category"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteId(category.id);
                      }}
                      className="p-1.5 text-slate-400 hover:bg-rose-100 hover:text-rose-600 rounded-lg transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <h3 className="font-bold text-xl text-slate-800">{category.name}</h3>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Category">
        <form onSubmit={handleAddCategory} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Category Name</label>
            <input name="categoryName" required placeholder="e.g. Groceries" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Type</label>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setModalType('expense')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                  modalType === 'expense' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Pengeluaran
              </button>
              <button
                type="button"
                onClick={() => setModalType('income')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                  modalType === 'income' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Pemasukkan
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Icon</label>
            <div className="flex flex-wrap gap-3">
              {AVAILABLE_ICONS.map((icon) => (
                <button
                  key={icon.name}
                  type="button"
                  onClick={() => setSelectedIcon(icon.name)}
                  className={`p-3 rounded-xl transition-all ${
                    selectedIcon === icon.name 
                      ? 'bg-indigo-500 text-white shadow-md shadow-indigo-200' 
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  <icon.component size={20} />
                </button>
              ))}
            </div>
          </div>
          <button type="submit" className="mt-4 w-full bg-indigo-500 hover:bg-indigo-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95">
            Save Category
          </button>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Category">
        <form onSubmit={handleEditCategory} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Category Name</label>
            <input name="categoryName" defaultValue={selectedCategory?.name} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Type</label>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setModalType('expense')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                  modalType === 'expense' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Pengeluaran
              </button>
              <button
                type="button"
                onClick={() => setModalType('income')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                  modalType === 'income' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Pemasukkan
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Icon</label>
            <div className="flex flex-wrap gap-3">
              {AVAILABLE_ICONS.map((icon) => (
                <button
                  key={icon.name}
                  type="button"
                  onClick={() => setSelectedIcon(icon.name)}
                  className={`p-3 rounded-xl transition-all ${
                    selectedIcon === icon.name 
                      ? 'bg-indigo-500 text-white shadow-md shadow-indigo-200' 
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  <icon.component size={20} />
                </button>
              ))}
            </div>
          </div>
          <button type="submit" className="mt-4 w-full bg-indigo-500 hover:bg-indigo-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95">
            Update Category
          </button>
        </form>
      </Modal>

      <ConfirmModal 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={executeDelete}
        isLoading={isDeleting}
        title="Delete Category"
        message="Are you sure you want to delete this category? Ensure no transactions or budgets are using it."
      />
    </div>
  );
}
