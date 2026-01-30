"use client"

import { useState } from "react"
import { Home, Bell } from "lucide-react"
import { GlobalSidebar } from "@/components/workbench/global-sidebar"
import { CategorySidebar } from "@/components/service-catalog/category-sidebar"
import { ServiceList } from "@/components/service-catalog/service-list"
import { CreateCategoryModal } from "@/components/service-catalog/create-category-modal"

export default function ServiceCatalogPage() {
  const [selectedCategory, setSelectedCategory] = useState("hr")
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [categoryModalMode, setCategoryModalMode] = useState<"create" | "edit">("create")
  const [editingCategory, setEditingCategory] = useState<any>(null)

  const handleAddCategory = () => {
    setCategoryModalMode("create")
    setEditingCategory(null)
    setShowCategoryModal(true)
  }

  const handleEditCategory = (category: any) => {
    setCategoryModalMode("edit")
    setEditingCategory(category)
    setShowCategoryModal(true)
  }

  const handleDeleteCategory = (id: string) => {
    console.log("Delete category:", id)
    // TODO: 实现删除逻辑
  }

  return (
    <div className="flex min-h-screen bg-white">
      <GlobalSidebar currentPage="service-catalog" />
      
      {/* Main Content */}
      <main className="flex-1 ml-[200px] flex flex-col">
        {/* Top Header */}
        <header className="h-14 px-6 flex items-center justify-between border-b border-gray-100 bg-white sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <Home className="w-5 h-5 text-gray-400" />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="relative p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex">
          {/* Category Sidebar */}
          <div className="w-[240px] flex-shrink-0 border-r border-gray-100">
            <CategorySidebar
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              onAddCategory={handleAddCategory}
              onEditCategory={handleEditCategory}
              onDeleteCategory={handleDeleteCategory}
            />
          </div>

          {/* Service List */}
          <ServiceList selectedCategory={selectedCategory} />
        </div>
      </main>

      {/* Create/Edit Category Modal */}
      <CreateCategoryModal 
        open={showCategoryModal} 
        onOpenChange={setShowCategoryModal}
        mode={categoryModalMode}
        initialValues={editingCategory}
      />
    </div>
  )
}
