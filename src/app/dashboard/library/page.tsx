"use client";
import React, { useEffect, useState, useRef } from "react";
import { useLibraryStore, Library } from "@/store/useLibraryStore";
import { useDocumentStore } from "@/store/useDocumentStore";
import { extractTextFromFile } from "@/utils/fileExtractor";
import { Button } from "@/vendors/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/vendors/ui/card";
import { Input } from "@/vendors/ui/input";
import { Progress } from "@/vendors/ui/progress";
import {
  Folder,
  FolderOpen,
  Plus,
  Search,
  Star,
  Trash2,
  Edit2,
  X,
  Loader2,
  BookOpen,
  ArrowRight,
  Play,
  UploadCloud,
  FileText,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LibraryPage() {
  const {
    libraries,
    loading,
    error,
    fetchLibraries,
    createLibrary,
    updateLibrary,
    deleteLibrary,
    toggleFavorite
  } = useLibraryStore();

  const router = useRouter();
  const { resumeLibraryPractice, uploadDocument } = useDocumentStore();
  const [resumeLoading, setResumeLoading] = useState<string | null>(null);

  // Drag-and-drop ingestion state
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragLoading, setDragLoading] = useState(false);
  const [selectedTargetLibId, setSelectedTargetLibId] = useState<string>("");
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resumePractice = async (libId: string) => {
    setResumeLoading(libId);
    try {
      await resumeLibraryPractice(libId, router);
    } finally {
      setResumeLoading(null);
    }
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Form states
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [selectedLibrary, setSelectedLibrary] = useState<Library | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  useEffect(() => {
    fetchLibraries();
  }, [fetchLibraries]);

  // Sync selected target library when libraries load
  useEffect(() => {
    if (libraries.length > 0 && !selectedTargetLibId) {
      setSelectedTargetLibId(libraries[0].id);
    }
  }, [libraries, selectedTargetLibId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const success = await createLibrary(newName.trim(), newDescription.trim());
    if (success) {
      setNewName("");
      setNewDescription("");
      setIsCreateOpen(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLibrary || !editName.trim()) return;
    const success = await updateLibrary(selectedLibrary.id, {
      name: editName.trim(),
      description: editDescription.trim(),
    });
    if (success) {
      setSelectedLibrary(null);
      setIsEditOpen(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedLibrary) return;
    const success = await deleteLibrary(selectedLibrary.id);
    if (success) {
      setSelectedLibrary(null);
      setIsDeleteOpen(false);
    }
  };

  // Drag & drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processDroppedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processDroppedFile(e.target.files[0]);
    }
  };

  const processDroppedFile = async (file: File) => {
    setDragLoading(true);
    setUploadFeedback(`Extracting text from "${file.name}"...`);

    try {
      const content = await extractTextFromFile(file);
      if (!content || !content.trim()) {
        throw new Error("The file appeared to be empty or unreadable.");
      }

      // Determine target library
      let targetLibId = selectedTargetLibId;
      if (!targetLibId && libraries.length > 0) {
        targetLibId = libraries[0].id;
      }

      // If no library exists yet, create one
      if (!targetLibId) {
        const created = await createLibrary("My Books & Notes", "Default collection for uploaded practice texts");
        if (created) {
          await fetchLibraries();
          const freshLibs = useLibraryStore.getState().libraries;
          if (freshLibs.length > 0) {
            targetLibId = freshLibs[0].id;
          }
        }
      }

      if (!targetLibId) {
        throw new Error("Unable to create or select destination library.");
      }

      // Clean file title
      const cleanTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");

      setUploadFeedback(`Structuring "${cleanTitle}" into lessons...`);
      const success = await uploadDocument(targetLibId, cleanTitle, content, file);
      
      if (success) {
        setUploadFeedback(`Successfully uploaded "${cleanTitle}"! Opening folder...`);
        setTimeout(() => {
          router.push(`/dashboard/library/${targetLibId}`);
        }, 800);
      } else {
        setUploadFeedback("Failed to ingest document. Please try again.");
      }
    } catch (err: any) {
      setUploadFeedback(`Error: ${err.message || "Failed to process file."}`);
    } finally {
      setDragLoading(false);
    }
  };

  // Filter & Sort libraries
  const filteredLibraries = libraries
    .filter((lib) => {
      const matchesSearch =
        lib.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lib.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFavorite = !showFavoritesOnly || lib.is_favorite;
      return matchesSearch && matchesFavorite;
    })
    .sort((a, b) => {
      if (a.is_favorite && !b.is_favorite) return -1;
      if (!a.is_favorite && b.is_favorite) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  return (
    <div className="space-y-8 animate-fade-in relative min-h-full pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-2.5">
            <Folder className="h-8 w-8 text-primary" />
            <span>Practice Library</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Organize book chapters, articles, and coding documentation into personal collections.
          </p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 rounded-xl px-5 font-bold transition-all duration-200 hover:scale-[1.02] cursor-pointer flex items-center gap-2 h-11"
        >
          <Plus className="h-4 w-4" />
          Create New Collection
        </Button>
      </div>

      {/* DRAG-AND-DROP BOOK INGESTION STUDIO BANNER */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative p-6 sm:p-8 rounded-3xl border-2 border-dashed transition-all duration-300 text-center
          ${
            isDragOver
              ? "border-primary bg-primary/10 scale-[1.01] shadow-xl shadow-primary/10"
              : "border-border/60 bg-secondary/5 hover:bg-secondary/10 hover:border-primary/40"
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md,.pdf,.docx"
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-3 max-w-lg mx-auto">
          <div className="p-3.5 bg-primary/10 text-primary rounded-2xl animate-pulse">
            {dragLoading ? (
              <Loader2 className="h-7 w-7 animate-spin" />
            ) : (
              <UploadCloud className="h-7 w-7" />
            )}
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-foreground">
              {dragLoading
                ? "Processing your document..."
                : "Drop your book or document here"}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Drag and drop any <span className="font-semibold text-foreground">.txt</span>, <span className="font-semibold text-foreground">.pdf</span>, <span className="font-semibold text-foreground">.docx</span>, or <span className="font-semibold text-foreground">.md</span> file to generate lessons.
            </p>
          </div>

          {/* Feedback banner if processing */}
          {uploadFeedback && (
            <div className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20 animate-fade-in flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 shrink-0" />
              <span>{uploadFeedback}</span>
            </div>
          )}

          {/* Controls: Target Library selector & browse button */}
          {!dragLoading && (
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {libraries.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-card/80 px-3 py-1.5 rounded-xl border border-border/50">
                  <span className="font-bold">Destination:</span>
                  <select
                    value={selectedTargetLibId}
                    onChange={(e) => setSelectedTargetLibId(e.target.value)}
                    className="bg-transparent font-semibold text-foreground focus:outline-hidden cursor-pointer"
                  >
                    {libraries.map((lib) => (
                      <option key={lib.id} value={lib.id} className="bg-card text-foreground">
                        {lib.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <Button
                size="sm"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl font-bold text-xs h-9 cursor-pointer hover:bg-secondary"
              >
                Browse File
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Controls: Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 items-center bg-card/40 backdrop-blur-xs border border-border/40 p-4 rounded-2xl">
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search collections..."
            className="pl-10 rounded-xl bg-background/50 border-border/60 focus-visible:ring-primary h-11"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto shrink-0 justify-end">
          <Button
            variant={showFavoritesOnly ? "default" : "outline"}
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className="rounded-xl font-semibold text-xs transition-colors flex items-center gap-2 w-full sm:w-auto justify-center cursor-pointer h-11"
          >
            <Star className={`h-4 w-4 ${showFavoritesOnly ? "fill-current" : ""}`} />
            {showFavoritesOnly ? "Showing Favorites" : "Filter Favorites"}
          </Button>
        </div>
      </div>

      {/* Loading state */}
      {loading && libraries.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 font-mono text-sm text-muted-foreground animate-pulse">
          <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
          Synchronizing library database...
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-sm font-semibold flex items-center gap-3">
          <X className="h-5 w-5 shrink-0" />
          <span>Error: {error}</span>
        </div>
      )}

      {/* Grid: Libraries with Separated Folder Navigation */}
      {!loading && filteredLibraries.length === 0 ? (
        <Card className="shadow-xs border-border/60 py-12 flex flex-col items-center justify-center text-center rounded-2xl">
          <div className="h-16 w-16 rounded-full bg-secondary/50 flex items-center justify-center text-muted-foreground mb-4">
            <Folder className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold">No collections found</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-6">
            {searchQuery || showFavoritesOnly
              ? "Try adjusting your search terms or favorite filters."
              : "Get started by creating your first folder collection to group typing materials."}
          </p>
          {!searchQuery && !showFavoritesOnly && (
            <Button onClick={() => setIsCreateOpen(true)} size="sm" className="rounded-xl font-bold cursor-pointer">
              Create Collection
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLibraries.map((lib) => (
            <Card
              key={lib.id}
              onClick={() => router.push(`/dashboard/library/${lib.id}`)}
              className="group hover:shadow-xl hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden relative cursor-pointer active:scale-[0.99] select-none rounded-2xl border-border/60"
            >
              {/* Star favorite indicator */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(lib.id, !lib.is_favorite);
                }}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-secondary transition-colors cursor-pointer z-10"
                title={lib.is_favorite ? "Remove from favorites" : "Add to favorites"}
              >
                <Star
                  className={`h-4.5 w-4.5 ${
                    lib.is_favorite
                      ? "text-yellow-500 fill-yellow-500"
                      : "text-muted-foreground/60 hover:text-yellow-500"
                  }`}
                />
              </button>

              <CardHeader className="space-y-2 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 text-primary rounded-xl shrink-0 group-hover:scale-105 transition-transform duration-200">
                    <FolderOpen className="h-5.5 w-5.5 fill-current" />
                  </div>
                  <div className="min-w-0 pr-8 flex-1">
                    <CardTitle className="text-lg font-black truncate text-foreground group-hover:text-primary transition-colors">
                      {lib.name}
                    </CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      {lib.document_count || 0} {(lib.document_count || 0) === 1 ? "document" : "documents"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6 flex-1 flex flex-col justify-between">
                <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem] leading-relaxed">
                  {lib.description || "Collection folder for book chapters and reading exercises."}
                </p>

                <div className="space-y-4">
                  {/* Progress bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[11px] font-semibold text-muted-foreground">
                      <span>Overall Progress</span>
                      <span className="font-mono text-foreground font-bold">{lib.progress_percent || 0}%</span>
                    </div>
                    <Progress value={lib.progress_percent || 0} className="h-1.5 rounded-full" />
                  </div>

                  {/* Actions footer: SEPARATED NAVIGATION & PRACTICE */}
                  <div className="pt-3 border-t border-border/30 flex justify-between items-center gap-2">
                    {/* Management icons */}
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLibrary(lib);
                          setEditName(lib.name);
                          setEditDescription(lib.description);
                          setIsEditOpen(true);
                        }}
                        className="h-8 w-8 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Edit Library"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLibrary(lib);
                          setIsDeleteOpen(true);
                        }}
                        className="h-8 w-8 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive cursor-pointer"
                        title="Delete Library"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    {/* Dedicated Practice Button */}
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          resumePractice(lib.id);
                        }}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl shadow-md shadow-primary/20 gap-1.5 px-3.5 h-8.5 cursor-pointer flex items-center"
                        title="Start typing practice in this folder immediately"
                      >
                        {resumeLoading === lib.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Play className="h-3 w-3 fill-current ml-0.5" />
                        )}
                        <span>Practice</span>
                      </Button>
                      
                      <div className="p-1 text-muted-foreground group-hover:text-primary transition-colors">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* --- CREATE MODAL --- */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
          <Card className="w-full max-w-md shadow-2xl border-border/80 rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border/30">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Folder className="h-5 w-5 text-primary" />
                Create New Collection
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCreateOpen(false)}
                className="h-8 w-8 rounded-full cursor-pointer"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <form onSubmit={handleCreate}>
              <CardContent className="space-y-4 pt-4 pb-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Collection Name
                  </label>
                  <Input
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Classic Literature, Biology Notes, React Docs"
                    className="rounded-xl border-border/60"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Description (Optional)
                  </label>
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Describe what documents will be in this collection..."
                    className="w-full min-h-[90px] p-3 text-sm bg-background border border-border/60 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateOpen(false)}
                    className="rounded-xl font-bold cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
                  >
                    Create Collection
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}

      {/* --- EDIT MODAL --- */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
          <Card className="w-full max-w-md shadow-2xl border-border/80 rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border/30">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Edit2 className="h-5 w-5 text-primary" />
                Edit Collection
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditOpen(false)}
                className="h-8 w-8 rounded-full cursor-pointer"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <form onSubmit={handleEdit}>
              <CardContent className="space-y-4 pt-4 pb-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Collection Name
                  </label>
                  <Input
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="rounded-xl border-border/60"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Description
                  </label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full min-h-[90px] p-3 text-sm bg-background border border-border/60 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditOpen(false)}
                    className="rounded-xl font-bold cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
                  >
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}

      {/* --- DELETE MODAL --- */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
          <Card className="w-full max-w-md shadow-2xl border-destructive/40 rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border/30">
              <CardTitle className="text-lg font-bold text-destructive flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Delete Collection
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDeleteOpen(false)}
                className="h-8 w-8 rounded-full cursor-pointer"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-4 pb-6">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete{" "}
                <span className="font-bold text-foreground">
                  {selectedLibrary?.name}
                </span>
                ? All documents and lesson chunks inside this folder will be permanently removed.
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDeleteOpen(false)}
                  className="rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDelete}
                  className="rounded-xl font-bold bg-destructive hover:bg-destructive/90 text-white cursor-pointer"
                >
                  Delete Collection
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
