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
    // Bulk deletion states
    const [selectedVariantIds, setSelectedVariantIds] = useState<Set<string>>(new Set());
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({
        categoryName: false,
        categoryValues: false,
    })

    const categoryRef = useRef<TextInput>(null);

    const categoryValuesRef = useRef<TextInput>(null);

    const rowErrorsRef = useRef<boolean[]>([]);

    const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;


    const handleCategoryNameChange = (text: string) => {
        setCurrentCategoryName(text);

        // Clear error while typing
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


    const generateCombinations = (cats: VariantCategory[]): string[][] => {
        if (cats.length === 0) return [];
        const valueArrays = cats.map(cat => cat.values);
        const combinations = valueArrays.reduce(
            (acc, values) => acc.flatMap(combo => values.map(value => [...combo, value])),
            [[]] as string[][]
        );
        return combinations;
    };

    // 🔥 NEW: Generate only MISSING variants (preserves existing data)
    const generateMissingVariants = (cats: VariantCategory[], basePrice: number) => {
        if (cats.length === 0) return;

        const allCombinations = generateCombinations(cats);
        const existingCombinationsSet = new Set(
            variants.map(v => JSON.stringify(v.combination))
        );

        const newVariants: Variant[] = allCombinations
            .filter(combo => !existingCombinationsSet.has(JSON.stringify(combo)))
            .map(combo => ({
                id: generateId(),
                combination: combo,
                price: basePrice,
                stock: 0,
                image: "",
            }));

        if (newVariants.length > 0) {
            setVariants(prev => [...prev, ...newVariants]);
            showToast(`${newVariants.length} new variant${newVariants.length !== 1 ? 's' : ''} generated. Existing variants preserved.`, 'success');

        }
    };

    // 🔥 NEW: Smart category save with incremental variant generation
    const handleSaveCategory = (basePrice: number, onValueChange?: () => void) => {
       
        const categoryNameError = validateCategoryName(
            currentCategoryName,
            categories
                .filter(cat => cat.id !== editingCategoryId)
                .map(cat => cat.name)
        );

        if (categoryNameError) {
            setFieldErrors(prev => ({ ...prev, categoryName: true }));
            showToast(categoryNameError, 'error');
            return;
        }

        const categoryValuesError = validateCategoryValues(currentCategoryValues);
        if (categoryValuesError) {
            setFieldErrors(prev => ({ ...prev, categoryValues: true }));
            showToast(categoryValuesError, 'error');
            return;
        }
        
        const values = currentCategoryValues
            .split(',')
            .map(v => v.trim())
            .filter(v => v.length > 0);

        if (values.length === 0) {
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
                // 🔥 Delete variants that use removed values
                const categoryIndex = categories.findIndex(cat => cat.id === editingCategoryId);
                setVariants(prev => prev.filter(variant => {
                    const valueInThisCategory = variant.combination[categoryIndex];
                    return !removedValues.includes(valueInThisCategory);
                }));
            }

            // Update category
            setCategories(prev =>
                prev.map(cat =>
                    cat.id === editingCategoryId
                        ? { ...cat, name: currentCategoryName.trim(), values }
                        : cat
                )
            );

            // 🔥 Generate ONLY missing variants if values were added
            if (addedValues.length > 0) {
                const updatedCategories = categories.map(cat =>
                    cat.id === editingCategoryId
                        ? { ...cat, name: currentCategoryName.trim(), values }
                        : cat
                );
                setTimeout(() => {
                    generateMissingVariants(updatedCategories, basePrice);
                    onValueChange?.();
                }, 100);
            }

        } else {
            // Adding new category
            const newCategory: VariantCategory = {
                id: generateId(),
                name: currentCategoryName.trim(),
                values,
            };
            const updatedCategories = [...categories, newCategory];
            setCategories(updatedCategories);

            // 🔥 Generate ONLY missing variants
            setTimeout(() => {
                generateMissingVariants(updatedCategories, basePrice);
                onValueChange?.();
            }, 100);
        }

        setCurrentCategoryName('');
        setCurrentCategoryValues('');
        setEditingCategoryId(null);
    };

    // 🔥 NEW: Remove category with confirmation (deletes ALL variants)
    const removeCategory = (id: string, onConfirm?: () => void) => {

        setCategories(prev => prev.filter(cat => cat.id !== id));
        setVariants([]);
        onConfirm?.();

    };

    const editCategory = (category: VariantCategory) => {
        setCurrentCategoryName(category.name);
        setCurrentCategoryValues(category.values.join(', '));
        setEditingCategoryId(category.id);
    };

    // 🔥 MANUAL: Full regeneration (replaces all variants)
    const handleGenerateVariants = (basePrice: number) => {
        if (categories.length === 0) {
            Alert.alert('Error', 'Please add at least one variant category');
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
                            id: generateId(),
                            combination: combo,
                            price: basePrice,
                            stock: 0,
                            image: "",
                        }));
                        setVariants(newVariants);
                        setStep(2);
                        Alert.alert('Success', `Generated ${newVariants.length} variants`);
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

    // Individual variant deletion
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
                    onPress: () => {
                        updateVariant(variantId, 'image', '');
                    },
                },
            ]
        );
    };

    const handleSave = (onSaveFn: Function, onCloseFn: Function) => {
        let hasError = false;
        let firstErrorMessage = "";

        variants.forEach((variant, index) => {
            const priceError = validatePrice(variant.price);
            const stockError = validateStock(variant.stock);

            // store per-row error state
            rowErrorsRef.current[index] = Boolean(priceError || stockError);

            // record first error found
            if (!hasError && (priceError || stockError)) {
                hasError = true;
                firstErrorMessage = priceError || stockError || "";
            }
        });

        // update UI for red borders


        if (hasError) {
            showToast(firstErrorMessage, "error");
            return; // stop save
        }

        // all good → proceed
        onSaveFn(categories, variants);
        onCloseFn();
    };

    const handleAddCustomVariant = (basePrice: number) => {
        const selectedValues = Object.values(selectedCategoryValues).filter(value => value);

        if (selectedValues.length === 0) {
            Alert.alert('Error', 'Please select at least one variant option');
            return;
        }

        const combination = categories.map(category =>
            selectedCategoryValues[category.id] || ''
        ).filter(value => value);

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
        Alert.alert('Success', 'Custom variant added');
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
            Alert.alert('Error', 'Please select at least one variant to delete');
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
                    },
                },
            ]
        );
    };

    return {
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
        selectedVariantIds,
        isSelectionMode,
        toggleVariantSelection,
        selectAllVariants,
        deselectAllVariants,
        toggleSelectionMode,
        deleteSelectedVariants,
        generateMissingVariants,
        toastVisible,
        toastMessage,
        toastType,
        setToastVisible,
        fieldErrors,
        rowErrorsRef,
        categoryRef,
        categoryValuesRef,
        handleCategoryNameChange,
        handleCategoryValuesChange,

    }
}

export default useVariant;