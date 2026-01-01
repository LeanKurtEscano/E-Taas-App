import { useRef, useState } from 'react';
import { Alert, TextInput } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Variant, VariantCategory } from '@/types/product/product';
import useToast from '../general/useToast';
import { validateCategoryName, validateCategoryValues } from '@/utils/validation/seller/productVariant';
import { validateStock, validatePrice } from '@/utils/validation/seller/productCrudValidation';

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
    const [selectedCategoryValues, setSelectedCategoryValues] = useState<{ [key: string]: string }>({});
    const { toastVisible, toastMessage, toastType, setToastVisible, showToast } = useToast();
    
    console.log("Current variants:", variants);
    // Bulk deletion states
    const [selectedVariantIds, setSelectedVariantIds] = useState<Set<string>>(new Set());
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    
    const [fieldErrors, setFieldErrors] = useState({
        categoryName: false,
        categoryValues: false,
    });

    const categoryRef = useRef<TextInput>(null);
    const categoryValuesRef = useRef<TextInput>(null);
    const rowErrorsRef = useRef<boolean[]>([]);

    // Helper to check if ID is from database (numeric) or temporary (string with underscore)
    const isExistingVariant = (id: string): boolean => {
        const numericId = Number(id);
        return !isNaN(numericId) && numericId > 0;
    };

    const isExistingCategory = (id: string): boolean => {
        const numericId = Number(id);
        return !isNaN(numericId) && numericId > 0;
    };

    // Generate temporary ID only for NEW variants/categories
    const generateId = () => `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const handleCategoryNameChange = (text: string) => {
        setCurrentCategoryName(text);
        if (fieldErrors.categoryName) {
            setFieldErrors(prev => ({ ...prev, categoryName: false }));
        }
    };

    const handleCategoryValuesChange = (text: string) => {
        setCurrentCategoryValues(text);
        if (fieldErrors.categoryValues) {
            setFieldErrors(prev => ({ ...prev, categoryValues: false }));
        }
    };

    const generateCombinations = (cats: VariantCategory[]): Record<string, string>[] => {
        if (cats.length === 0) return [];
        
        const valueArrays = cats.map(cat => ({
            name: cat.name,
            values: cat.values
        }));
        
        const combinations = valueArrays.reduce(
            (acc, { name, values }) => 
                acc.flatMap(combo => 
                    values.map(value => ({ ...combo, [name]: value }))
                ),
            [{}] as Record<string, string>[]
        );
        
        return combinations;
    };

    // Generate only MISSING variants (preserves existing data)
    const generateMissingVariants = (cats: VariantCategory[], basePrice: number) => {
        if (cats.length === 0) return;

        const allCombinations = generateCombinations(cats);
        const existingCombinationsSet = new Set(
            variants.map(v => JSON.stringify(v.combination))
        );

        const newVariants: Variant[] = allCombinations
            .filter(combo => !existingCombinationsSet.has(JSON.stringify(combo)))
            .map(combo => ({
                id: generateId(), // Always use temporary ID for NEW variants
                name: Object.values(combo).join(' - '),
                combination: combo,
                price: basePrice,
                stock: 0,
                imageUri: undefined,
            }));

        if (newVariants.length > 0) {
            setVariants(prev => [...prev, ...newVariants]);
            showToast(`${newVariants.length} new variant${newVariants.length !== 1 ? 's' : ''} generated. Existing variants preserved.`, 'success');
        }
    };

    // Smart category save with incremental variant generation
    const handleSaveCategory = (basePrice: number, onValueChange?: () => void) => {
        const categoryNameError = validateCategoryName(
            currentCategoryName,
            categories
                .filter(cat => cat.id !== editingCategoryId)
                .map(cat => cat.name)
        );

        if (categoryNameError) {
            setFieldErrors(prev => ({ ...prev, categoryName: true }));
            categoryRef.current?.focus();
            showToast(categoryNameError, 'error');
            return;
        }

        const categoryValuesError = validateCategoryValues(currentCategoryValues);
        if (categoryValuesError) {
            setFieldErrors(prev => ({ ...prev, categoryValues: true }));
            categoryValuesRef.current?.focus();
            showToast(categoryValuesError, 'error');
            return;
        }

        const values = currentCategoryValues
            .split(',')
            .map(v => v.trim())
            .filter(v => v.length > 0);

        if (values.length === 0) {
            setFieldErrors(prev => ({ ...prev, categoryValues: true }));
            categoryValuesRef.current?.focus();
            showToast('Please enter at least one value (comma-separated)', 'error');
            return;
        }

        if (editingCategoryId) {
            // Editing existing category
            const oldCategory = categories.find(cat => cat.id === editingCategoryId);
            if (!oldCategory) return;

            const oldValues = new Set(oldCategory.values);
            const newValues = new Set(values);

            // Find added and removed values
            const addedValues = values.filter(v => !oldValues.has(v));
            const removedValues = oldCategory.values.filter(v => !newValues.has(v));

            if (removedValues.length > 0) {
                // Delete variants that use removed values
                const categoryName = oldCategory.name;
                setVariants(prev => prev.filter(variant => {
                    const valueInThisCategory = variant.combination[categoryName];
                    return !removedValues.includes(valueInThisCategory);
                }));
            }

            // Update category (preserve ID if it's from database)
            const updatedCategories = categories.map(cat =>
                cat.id === editingCategoryId
                    ? { 
                        ...cat, 
                        id: cat.id, // Preserve original ID (database or temp)
                        name: currentCategoryName.trim(), 
                        values 
                      }
                    : cat
            );
            
            setCategories(updatedCategories);

            // Generate ONLY missing variants if values were added
            if (addedValues.length > 0) {
                setTimeout(() => {
                    generateMissingVariants(updatedCategories, basePrice);
                    onValueChange?.();
                }, 100);
            }

            showToast('Category updated successfully', 'success');

        } else {
            // Adding new category - use temporary ID
            const newCategory: VariantCategory = {
                id: generateId(),
                name: currentCategoryName.trim(),
                values,
            };
            const updatedCategories = [...categories, newCategory];
            setCategories(updatedCategories);

            // Generate ONLY missing variants
            setTimeout(() => {
                generateMissingVariants(updatedCategories, basePrice);
                onValueChange?.();
            }, 100);

            showToast('Category added successfully', 'success');
        }

        setCurrentCategoryName('');
        setCurrentCategoryValues('');
        setEditingCategoryId(null);
        setFieldErrors({ categoryName: false, categoryValues: false });
    };

    const removeCategory = (id: string, onConfirm?: () => void) => {
        setCategories(prev => prev.filter(cat => cat.id !== id));
        setVariants([]);
        showToast('Category removed. All variants deleted.', 'success');
        onConfirm?.();
    };

    const editCategory = (category: VariantCategory) => {
        setCurrentCategoryName(category.name);
        setCurrentCategoryValues(category.values.join(', '));
        setEditingCategoryId(category.id);
    };

    // Full regeneration (replaces all variants)
    const handleGenerateVariants = (basePrice: number) => {
        if (categories.length === 0) {
            showToast('Please add at least one variant category', 'error');
            return;
        }

        Alert.alert(
            'Regenerate All Variants',
            'This will replace all existing variants with fresh ones. Any custom data (price, stock, images) will be reset.\n\nContinue?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Regenerate',
                    onPress: () => {
                        const combinations = generateCombinations(categories);
                        const newVariants: Variant[] = combinations.map(combo => ({
                            id: generateId(), // Use temporary IDs for all new variants
                            name: Object.values(combo).join(' - '),
                            combination: combo,
                            price: basePrice,
                            stock: 0,
                            imageUri: undefined,
                        }));
                        setVariants(newVariants);
                        setStep(2);
                        showToast(`Generated ${newVariants.length} variants`, 'success');
                    },
                },
            ]
        );
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
                        showToast('Variant deleted', 'success');
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

            const priceError = validatePrice(price.toString());
            const stockError = validateStock(stock.toString());

            if (priceError) {
                showToast(priceError, 'error');
                return;
            }

            if (stockError) {
                showToast(stockError, 'error');
                return;
            }

            const variantIndex = variants.findIndex(v => v.id === editingVariantId);
            rowErrorsRef.current[variantIndex] = false;

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
                showToast('Please grant camera roll permissions', 'error');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                quality: 0.8,
                aspect: [1, 1] as [number, number],
            });

            if (!result.canceled && result.assets[0]) {
                updateVariant(variantId, 'imageUri', result.assets[0].uri);
              
            }
        } catch (error) {
            showToast('Failed to pick image', 'error');
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
                    onPress: () => {
                        updateVariant(variantId, 'imageUri', undefined);
                        showToast('Image removed', 'success');
                    },
                },
            ]
        );
    };

    const handleSave = (onSaveFn: Function, onCloseFn: Function) => {
        let hasError = false;
        let firstErrorMessage = "";

        variants.forEach((variant, index) => {
            const priceError = validatePrice(variant.price.toString());
            const stockError = validateStock(variant.stock.toString());

            rowErrorsRef.current[index] = Boolean(priceError || stockError);

            if (!hasError && (priceError || stockError)) {
                hasError = true;
                firstErrorMessage = priceError || stockError || "";
            }
        });

        if (hasError) {
            showToast(firstErrorMessage, "error");
            return;
        }

        onSaveFn(categories, variants);
        onCloseFn();
    };

    const handleAddCustomVariant = (basePrice: number) => {
        const selectedValues = Object.values(selectedCategoryValues).filter(value => value);

        if (selectedValues.length !== categories.length) {
            showToast('Please select a value for each category', 'error');
            return;
        }

        const combination: Record<string, string> = {};
        categories.forEach(category => {
            const value = selectedCategoryValues[category.id];
            if (value) {
                combination[category.name] = value;
            }
        });

        const exists = variants.some(variant =>
            JSON.stringify(variant.combination) === JSON.stringify(combination)
        );

        if (exists) {
            showToast('This variant combination already exists', 'error');
            return;
        }

        const newVariant: Variant = {
            id: generateId(), // Use temporary ID for custom variant
            name: Object.values(combination).join(' - '),
            combination,
            price: basePrice,
            stock: 0,
            imageUri: undefined,
        };

        setVariants(prev => [...prev, newVariant]);
        setSelectedCategoryValues({});
        setShowCustomVariant(false);
        showToast('Custom variant added', 'success');
    };

    const handleCategoryValueSelect = (categoryId: string, value: string) => {
        setSelectedCategoryValues(prev => ({
            ...prev,
            [categoryId]: prev[categoryId] === value ? '' : value
        }));
    };

    // Bulk deletion functions
    const toggleVariantSelection = (variantId: string) => {
        setSelectedVariantIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(variantId)) {
                newSet.delete(variantId);
            } else {
                newSet.add(variantId);
            }
            return newSet;
        });
    };

    const selectAllVariants = () => {
        const allIds = new Set(variants.map(v => v.id));
        setSelectedVariantIds(allIds);
    };

    const deselectAllVariants = () => {
        setSelectedVariantIds(new Set());
    };

    const toggleSelectionMode = () => {
        setIsSelectionMode(prev => !prev);
        if (isSelectionMode) {
            deselectAllVariants();
        }
    };

    const deleteSelectedVariants = () => {
        if (selectedVariantIds.size === 0) {
            showToast('Please select at least one variant to delete', 'error');
            return;
        }

        Alert.alert(
            'Delete Selected Variants',
            `Are you sure you want to delete ${selectedVariantIds.size} variant${selectedVariantIds.size !== 1 ? 's' : ''}? This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        setVariants(prev => prev.filter(variant => !selectedVariantIds.has(variant.id)));
                        setSelectedVariantIds(new Set());
                        setIsSelectionMode(false);
                        showToast(`Deleted ${selectedVariantIds.size} variants`, 'success');
                    },
                },
            ]
        );
    };

    return {
        // State
        step,
        categories,
        variants,
        currentCategoryName,
        currentCategoryValues,
        editingCategoryId,
        editingVariantId,
        editPrice,
        editStock,
        showCustomVariant,
        selectedCategoryValues,
        selectedVariantIds,
        isSelectionMode,
        fieldErrors,
        toastVisible,
        toastMessage,
        toastType,
        
        // Refs
        categoryRef,
        categoryValuesRef,
        rowErrorsRef,
        
        // Setters
        setStep,
        setCategories,
        setVariants,
        setShowCustomVariant,
        setSelectedCategoryValues,
        setToastVisible,
        setEditPrice,
        setEditStock,
        
        // Functions
        handleCategoryNameChange,
        handleCategoryValuesChange,
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
        toggleVariantSelection,
        selectAllVariants,
        deselectAllVariants,
        toggleSelectionMode,
        deleteSelectedVariants,
        generateMissingVariants,
        generateCombinations,
        
        // Helper functions (exposed for external use if needed)
        isExistingVariant,
        isExistingCategory,
    };
};

export default useVariant;