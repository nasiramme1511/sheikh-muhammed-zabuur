import { useState, useEffect } from 'react';
import { resources as resourcesApi, collections as collectionsApi } from '../lib/api';
import type { Resource } from '../types';

interface UseResourceLibraryOptions {
  type: 'AUDIO' | 'VIDEO' | 'PDF';
  allLabel: string;
}

export function useResourceLibrary({ type, allLabel }: UseResourceLibraryOptions) {
  const [items, setItems] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(allLabel);
  const [sortBy, setSortBy] = useState<'latest' | 'downloads' | 'views'>('latest');
  const [collectionStats, setCollectionStats] = useState<Record<string, number>>({});
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await resourcesApi.getAll({ type });
      const filtered = type !== 'PDF'
        ? res.data.filter((r: any) => r.fileType !== 'recording')
        : res.data;
      setItems(filtered);
    } catch (err) {
      console.error(`Error fetching ${type.toLowerCase()}s:`, err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCollectionItems = async (slug: string) => {
    setLoading(true);
    try {
      const res = await collectionsApi.getBySlug(slug, { type });
      const data = Array.isArray(res.data) ? res.data : [];
      setItems(data);
    } catch (err) {
      console.error(`Error fetching collection ${type.toLowerCase()}s:`, err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCollectionStats = async () => {
    try {
      const res = await collectionsApi.getStats();
      setCollectionStats(res.data || {});
    } catch (err) {
      console.error('Error fetching collection stats:', err);
    }
  };

  const handleClearCollection = () => {
    setSelectedCollection(null);
    fetchItems();
  };

  useEffect(() => {
    fetchItems();
    fetchCollectionStats();
  }, []);

  useEffect(() => {
    if (selectedCollection) {
      fetchCollectionItems(selectedCollection);
    }
  }, [selectedCollection]);

  const filteredItems = items
    .filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === allLabel ||
        item.category.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'downloads') return (b.downloads || 0) - (a.downloads || 0);
      if (sortBy === 'views') return (b.views || 0) - (a.views || 0);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return {
    items,
    setItems,
    loading,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    collectionStats,
    selectedCollection,
    setSelectedCollection,
    viewMode,
    setViewMode,
    handleClearCollection,
    filteredItems,
    fetchItems,
  };
}