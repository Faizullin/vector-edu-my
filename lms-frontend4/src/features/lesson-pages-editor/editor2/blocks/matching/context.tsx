import type { useComponentBaseForm } from "@/components/form/component-base";
import { Log } from "@/utils/log";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
  type RefObject,
} from "react";
import type {
  Matching,
  MatchingComponent,
  matchingComponentSchema,
  MatchingCouple,
  MatchingElement,
} from "./schema";
import { generateCoupleTrackId, getElementFileKey } from "./utils";

type HookFormType = ReturnType<
  typeof useComponentBaseForm<MatchingComponent, typeof matchingComponentSchema>
>;
interface MatchingQuestionsContextType {
  // State
  matchingComponent: Matching;
  elements: MatchingElement[];
  activeSection: "elements" | "couples" | "preview";
  searchQuery: string;
  editingElementId: string | null;
  activeCoupleTab: string | null;
  fileInputRefs: RefObject<Record<string, HTMLInputElement | null>>;

  // Actions
  setActiveSection: (section: "elements" | "couples" | "preview") => void;
  setSearchQuery: (query: string) => void;
  setEditingElementId: (id: string | null) => void;
  setActiveCoupleTab: (id: string | null) => void;

  // Element operations
  addElement: () => void;
  removeElement: (elementId: string) => void;
  updateElementText: (elementId: string, text: string) => void;
  handleFileChange: (
    e: ChangeEvent<HTMLInputElement>,
    elementId: string
  ) => void;
  removeImage: (elementId: string) => void;

  // Couple operations
  addCouple: () => void;
  removeCouple: (coupleId: string) => void;
  updateCouple: (
    coupleId: string,
    field: "first_element" | "second_element",
    elementId: string
  ) => void;

  // Utility functions
  triggerFileInput: (inputId: string) => void;
  getCoupleCount: (elementId: string) => number;
  getElementCouples: (elementId: string) => MatchingCouple[];
  isCoupled: (firstElementId: string, secondElementId: string) => boolean;

  // Form actions
  handlePreview: () => void;
  handleSave: () => void;
}

const MatchingQuestionsContext = createContext<
  MatchingQuestionsContextType | undefined
>(undefined);

export function MatchingQuestionsProvider({
  children,
  formHook,
}: {
  children: ReactNode;
  formHook: HookFormType;
}) {
  // State for the overall component
  const [matchingComponent, setMatchingComponent] = useState<Matching>({
    title: "",
    couples: [],
    elements: [],
  });

  // State for all elements (separate from couples for easier management)
  const [elements, setElements] = useState<MatchingElement[]>([
    { uid: "elem1", text: "First element example", image: null },
    { uid: "elem2", text: "Second element example", image: null },
  ]);

  // UI state
  const [activeSection, setActiveSection] = useState<
    "elements" | "couples" | "preview"
  >("elements");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const [activeCoupleTab, setActiveCoupleTab] = useState<string | null>(null);

  // Initialize with a default couple if none exists
  // useEffect(() => {
  //   if (matchingComponent.couples.length === 0 && elements.length >= 2) {
  //     const newCouple: MatchingCouple = {
  //       trackUid: generateCoupleTrackId(elements[0], elements[1]),
  //       first_element: elements[0].uid,
  //       second_element: elements[1].uid,
  //     };
  //     setMatchingComponent({
  //       ...matchingComponent,
  //       couples: [newCouple],
  //     });
  //     setActiveCoupleTab("couple1");
  //   }
  // }, []);

  useEffect(() => {
    Log.info("MatchingQuestionsProvider.formHook.record", formHook.record);
    if (formHook.record) {
      const newData: Matching = {
        title: formHook.record.title,
        elements: formHook.record.elements.map((el: { uid: any; text: any; image: any; }) => ({
          uid: el.uid,
          text: el.text,
          image_file: null,
          image: el.image,
        })),
        couples: [],
      };
      formHook.record.couples.forEach((cp: { first_element: any; second_element: any; }) => {
        const firstElement = formHook.record!.elements.find(
          (el: { uid: any; }) => el.uid === cp.first_element
        );
        const secondElement = formHook.record!.elements.find(
          (el: { uid: any; }) => el.uid === cp.second_element
        );
        if (firstElement && secondElement) {
          newData.couples.push({
            first_element: firstElement.uid,
            second_element: secondElement.uid,
            trackUid: generateCoupleTrackId(firstElement, secondElement),
          });
        }
      });
      setMatchingComponent(newData);
      setElements(newData.elements);
    }
  }, [formHook.record]);

  // Use refs to store file input references
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Add a new element
  const addElement = () => {
    const newId = `elem${elements.length + 1}`;
    const newElement: MatchingElement = { uid: newId, text: "", image: null };
    setElements([...elements, newElement]);
    setEditingElementId(newId);
  };

  // Remove an element
  const removeElement = (elementId: string) => {
    // Check if element is used in any couples
    const isUsed = matchingComponent.couples.some(
      (couple) =>
        couple.first_element === elementId ||
        couple.second_element === elementId
    );

    if (isUsed) {
      alert(
        "This element is used in one or more couples. Remove those couples first."
      );
      return;
    }

    setElements(elements.filter((element) => element.uid !== elementId));
    if (editingElementId === elementId) {
      setEditingElementId(null);
    }
  };

  // Update element text
  const updateElementText = (elementId: string, text: string) => {
    // Update in elements array
    const updatedElements = elements.map((element) =>
      element.uid === elementId ? { ...element, text } : element
    );
    setElements(updatedElements);

    // Also update in any couples that use this element
    const updatedElement = updatedElements.find((e) => e.uid === elementId);
    if (updatedElement) {
      const updatedCouples = matchingComponent.couples.map((couple) => {
        let newCouple = { ...couple };
        if (couple.first_element === elementId) {
          newCouple = { ...newCouple, first_element: updatedElement.uid };
        }
        if (couple.second_element === elementId) {
          newCouple = { ...newCouple, second_element: updatedElement.uid };
        }
        return newCouple;
      });

      setMatchingComponent({
        ...matchingComponent,
        couples: updatedCouples,
      });
    }
  };

  // Handle file upload
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    elementId: string
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);

      // Update in elements array
      const updatedElements = elements.map((element) =>
        element.uid === elementId
          ? { ...element, image: { url: imageUrl } }
          : element
      );
      setElements(updatedElements);

      // Also update in any couples that use this element
      const updatedElement = updatedElements.find((e) => e.uid === elementId);
      if (updatedElement) {
        const updatedCouples = matchingComponent.couples.map((couple) => {
          if (couple.first_element === elementId) {
            return { ...couple, first_element: updatedElement.uid };
          }
          if (couple.second_element === elementId) {
            return { ...couple, second_element: updatedElement.uid };
          }
          return couple;
        });

        setMatchingComponent({
          ...matchingComponent,
          couples: updatedCouples,
        });
      }
    }
  };

  // Remove image
  const removeImage = (elementId: string) => {
    // Update in elements array
    const updatedElements = elements.map((element) =>
      element.uid === elementId ? { ...element, image: null } : element
    );
    setElements(updatedElements);

    // Also update in any couples that use this element
    const updatedElement = updatedElements.find((e) => e.uid === elementId);
    if (updatedElement) {
      const updatedCouples = matchingComponent.couples.map((couple) => {
        if (couple.first_element === elementId) {
          return { ...couple, first_element: updatedElement.uid };
        }
        if (couple.second_element === elementId) {
          return { ...couple, second_element: updatedElement.uid };
        }
        return couple;
      });

      setMatchingComponent({
        ...matchingComponent,
        couples: updatedCouples,
      });
    }
  };

  // Add a new couple
  const addCouple = () => {
    if (elements.length < 2) {
      alert("You need at least two elements to create a couple");
      return;
    }

    const newId = `couple${matchingComponent.couples.length + 1}`;
    const newCouple: MatchingCouple = {
      trackUid: newId,
      first_element: elements[0].uid,
      second_element: elements[1].uid,
    };

    setMatchingComponent({
      ...matchingComponent,
      couples: [...matchingComponent.couples, newCouple],
    });
    setActiveCoupleTab(newId);
  };

  // Remove a couple
  const removeCouple = (coupleId: string) => {
    if (matchingComponent.couples.length <= 1) return;

    const updatedCouples = matchingComponent.couples.filter(
      (couple) => couple.trackUid !== coupleId
    );

    setMatchingComponent({
      ...matchingComponent,
      couples: updatedCouples,
    });

    // Set active tab to the first couple if the active tab is removed
    if (activeCoupleTab === coupleId) {
      setActiveCoupleTab(updatedCouples[0]?.trackUid || null);
    }
  };

  // Update couple
  const updateCouple = (
    coupleId: string,
    field: "first_element" | "second_element",
    elementId: string
  ) => {
    const selectedElement = elements.find((e) => e.uid === elementId);
    if (!selectedElement) return;

    const updatedCouples = matchingComponent.couples.map((couple) => {
      if (couple.trackUid === coupleId) {
        return { ...couple, [field]: selectedElement };
      }
      return couple;
    });

    setMatchingComponent({
      ...matchingComponent,
      couples: updatedCouples,
    });
  };

  const triggerFileInput = (inputId: string) => {
    fileInputRefs.current[inputId]?.click();
  };

  const handlePreview = () => {
    setActiveSection("preview");
  };

  const handleSave = async () => {
    const submitData = {
      title: formHook.form.getValues().title,
      couples: matchingComponent.couples.map((couple) => {
        const firstElement = elements.find(
          (element) => element.uid === couple.first_element
        );
        const secondElement = elements.find(
          (element) => element.uid === couple.second_element
        );
        return {
          first_element: firstElement?.uid || null,
          second_element: secondElement?.uid || null,
        };
      }),
      elements: elements.map((element) => {
        const newElement = {
          uid: element.uid,
          text: element.text,
          image_file: undefined,
        };
        const file =
          fileInputRefs.current[getElementFileKey(element)]?.files?.[0];
        if (file) {
          (newElement as any).image_file = file;
        }
        return newElement;
      }),
    };

    formHook.form.clearErrors();
    formHook.form.setValue("elements", submitData.elements);
    formHook.form.setValue("couples", submitData.couples);
    formHook.handleSubmit();
  };

  // Count how many couples an element is part of
  const getCoupleCount = (elementId: string) => {
    return matchingComponent.couples.filter(
      (couple) =>
        couple.first_element === elementId ||
        couple.second_element === elementId
    ).length;
  };

  // Get all couples for an element
  const getElementCouples = (elementId: string) => {
    return matchingComponent.couples.filter(
      (couple) =>
        couple.first_element === elementId ||
        couple.second_element === elementId
    );
  };

  // Check if a couple exists between two elements
  const isCoupled = (firstElementId: string, secondElementId: string) => {
    return matchingComponent.couples.some(
      (couple) =>
        (couple.first_element === firstElementId &&
          couple.second_element === secondElementId) ||
        (couple.first_element === secondElementId &&
          couple.second_element === firstElementId)
    );
  };

  const value = {
    // State
    matchingComponent,
    elements,
    activeSection,
    searchQuery,
    editingElementId,
    activeCoupleTab,
    fileInputRefs,

    // Actions
    setActiveSection,
    setSearchQuery,
    setEditingElementId,
    setActiveCoupleTab,

    // Element operations
    addElement,
    removeElement,
    updateElementText,
    handleFileChange,
    removeImage,

    // Couple operations
    addCouple,
    removeCouple,
    updateCouple,

    // Utility functions
    triggerFileInput,
    getCoupleCount,
    getElementCouples,
    isCoupled,

    // Form actions
    handlePreview,
    handleSave,
  };

  return (
    <MatchingQuestionsContext.Provider value={value}>
      {children}
    </MatchingQuestionsContext.Provider>
  );
}

export function useMatchingQuestions() {
  const context = useContext(MatchingQuestionsContext);
  if (context === undefined) {
    throw new Error(
      "useMatchingQuestions must be used within a MatchingQuestionsProvider"
    );
  }
  return context;
}
