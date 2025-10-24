import { View, Text } from 'react-native'
import React from 'react'
import { useState } from 'react';
import { Variant, VariantCategory } from '@/types/product/product';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
const useVariant = () => {
    const [step, setStep] = useState<1 | 2>(1);
    const [categories, setCategories] = useState<VariantCategory[]>([]);
    const [variants, setVariants] = useState<Variant[]>([]);
    const [currentCategoryName, setCurrentCategoryName] = useState('');
    const [currentCategoryValues, setCurrentCategoryValues] = useState('');
    const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
    const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
    const [editPrice, setEditPrice] = useState('');
    const [editStock, setEditStock] = useState('');
  const [showCustomVariant, setShowCustomVariant] = useState(false);
  const [selectedCategoryValues, setSelectedCategoryValues] = useState<{[key: string]: string}>({});


    const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const generateCombinations = (cats: VariantCategory[]): string[][] => {
        if (cats.length === 0) return [];

        const valueArrays = cats.map(cat => cat.values);
        const combinations = valueArrays.reduce(
            (acc, values) => acc.flatMap(combo => values.map(value => [...combo, value])),
            [[]] as string[][]
        );

        return combinations;
    };

    const handleSaveCategory = () => {
        if (!currentCategoryName.trim()) {
            Alert.alert('Error', 'Please enter category name');
            return;
        }

        const values = currentCategoryValues
            .split(',')
            .map(v => v.trim())
            .filter(v => v.length > 0);

        if (values.length === 0) {
            Alert.alert('Error', 'Please enter at least one value (comma-separated)');
            return;
        }

        if (editingCategoryId) {
            setCategories(prev =>
                prev.map(cat =>
                    cat.id === editingCategoryId
                        ? { ...cat, name: currentCategoryName.trim(), values }
                        : cat
                )
            );
        } else {
            const newCategory: VariantCategory = {
                id: generateId(),
                name: currentCategoryName.trim(),
                values,
            };
            setCategories(prev => [...prev, newCategory]);
        }

        setCurrentCategoryName('');
        setCurrentCategoryValues('');
        setEditingCategoryId(null);
    };

    const removeCategory = (id: string) => {
        Alert.alert(
            'Remove Category',
            'Are you sure you want to remove this category?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => {
                        setCategories(prev => prev.filter(cat => cat.id !== id));
                        setVariants([]);
                    },
                },
            ]
        );
    };

    const editCategory = (category: VariantCategory) => {
        setCurrentCategoryName(category.name);
        setCurrentCategoryValues(category.values.join(', '));
        setEditingCategoryId(category.id);
    };

    const handleGenerateVariants = (basePrice: number) => {
        if (categories.length === 0) {
            Alert.alert('Error', 'Please add at least one variant category');
            return;
        }

        const combinations = generateCombinations(categories);
        const newVariants: Variant[] = combinations.map(combo => {
            const existing = variants.find(v =>
                JSON.stringify(v.combination) === JSON.stringify(combo)
            );

            return existing || {
                id: generateId(),
                combination: combo,
                price: basePrice,
                stock: 0,
                image: "",
            };
        });

        setVariants(newVariants);
        setStep(2);
    };

    const updateVariant = (id: string, field: keyof Variant, value: any) => {
        setVariants(prev =>
            prev.map(variant =>
                variant.id === id ? { ...variant, [field]: value } : variant
            )
        );
    };

    const deleteVariant = (variantId: string) => {
        Alert.alert(
            'Delete Variant',
            'Are you sure you want to delete this variant? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        setVariants(prev => prev.filter(variant => variant.id !== variantId));
                    },
                },
            ]
        );
    };

    const startEditingVariant = (variant: Variant) => {
        setEditingVariantId(variant.id);
        setEditPrice(variant.price.toString());
        setEditStock(variant.stock.toString());
    };

    const saveEditingVariant = () => {
        if (editingVariantId) {
            const price = parseFloat(editPrice) || 0;
            const stock = parseInt(editStock) || 0;

            if (price <= 0) {
                Alert.alert('Error', 'Price must be greater than 0');
                return;
            }

            if (stock < 0) {
                Alert.alert('Error', 'Stock cannot be negative');
                return;
            }

            updateVariant(editingVariantId, 'price', price);
            updateVariant(editingVariantId, 'stock', stock);
            setEditingVariantId(null);
            setEditPrice('');
            setEditStock('');
        }
    };

    const cancelEditingVariant = () => {
        setEditingVariantId(null);
        setEditPrice('');
        setEditStock('');
    };

    const pickVariantImage = async (variantId: string) => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert('Permission needed', 'Please grant camera roll permissions');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.8,
                aspect: [1, 1],
            });

            if (!result.canceled && result.assets[0]) {
                updateVariant(variantId, 'image', result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const removeVariantImage = (variantId: string) => {
        Alert.alert(
            'Remove Image',
            'Are you sure you want to remove this image?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => {updateVariant(variantId, 'image', '');
                        
                    },
                },
            ]
        );
    };

    const handleSave = (onSaveFn: Function, onCloseFn: Function) => {
        const invalidVariants = variants.filter(v => v.price <= 0 || v.stock < 0);
        if (invalidVariants.length > 0) {
            Alert.alert('Error', 'Please ensure all variants have valid price and stock');
            return;
        }

        onSaveFn(categories, variants);
        onCloseFn();
    };


    const handleAddCustomVariant = (basePrice: number) => {
      
        const selectedValues = Object.values(selectedCategoryValues).filter(value => value);
        
        if (selectedValues.length === 0) {
          Alert.alert('Error', 'Please select at least one variant option');
          return;
        }
    
        // Create combination array in the same order as categories
        const combination = categories.map(category => 
          selectedCategoryValues[category.id] || ''
        ).filter(value => value); // Remove empty values
    
        // Check if this combination already exists
        const exists = variants.some(variant => 
          JSON.stringify(variant.combination) === JSON.stringify(combination)
        );
    
        if (exists) {
          Alert.alert('Error', 'This variant combination already exists');
          return;
        }
    
        const newVariant: Variant = {
          id: generateId(),
          combination,
          price: basePrice,
          stock: 0,
          image: "",
        };
    
        setVariants(prev => [...prev, newVariant]);
        setSelectedCategoryValues({});
        setShowCustomVariant(false);
      };
    
      const handleCategoryValueSelect = (categoryId: string, value: string) => {
        setSelectedCategoryValues(prev => ({
          ...prev,
          [categoryId]: prev[categoryId] === value ? '' : value // Toggle selection
        }));
      };
    

    return  {
        step,
        setStep,
        categories,
        setCategories,
        variants,
        setVariants,
        generateCombinations,
        currentCategoryName,
        setCurrentCategoryName,
        currentCategoryValues,
        setCurrentCategoryValues,
        editingCategoryId,
        setEditingCategoryId,
        editingVariantId,
        setEditingVariantId,
        editPrice,
        setEditPrice,
        editStock,
        setEditStock,
        handleSaveCategory,
        removeCategory,
        editCategory,
        handleGenerateVariants,
        updateVariant,
        deleteVariant,
        startEditingVariant,
        saveEditingVariant,
        cancelEditingVariant,
        pickVariantImage,
        removeVariantImage,
        handleSave,
        handleAddCustomVariant,
        handleCategoryValueSelect,
        showCustomVariant,
        setShowCustomVariant,
        selectedCategoryValues,
        setSelectedCategoryValues,
    }



}

export default useVariant