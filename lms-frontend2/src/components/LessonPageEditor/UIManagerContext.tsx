import { Log } from "@/utils/log";
import {createContext, FC, PropsWithChildren, useContext, useEffect, useState} from "react";

export type UIEntry = {
    id?: string;
    key: string; // e.g. 'form.user.edit'
    variant?: "modal" | "drawer"; // or component-specific
    open?: boolean; // for modals or drawers
    props?: Record<string, unknown>;
};

type UIManagerContextType = {
    entries: UIEntry[];
    createUI: (entry: UIEntry) => string;
    destroyUI: (id: string) => void;
    closeUI: (id: string) => void;
    getUIProps: (id: string) => { open: boolean; destroy: () => void } | null;
};

const UIManagerContext = createContext<UIManagerContextType | null>(null);

export const UIManagerProvider: FC<PropsWithChildren> = ({children}) => {
    const [entries, setEntries] = useState<UIEntry[]>([]);

    const createUI = (entry: UIEntry) => {
        const id = entry.id ?? crypto.randomUUID();
        const open = entry.open ?? true;
        setEntries((prev) => {
            const existingEntry = prev.find((e) => e.id === id);
            let newData = [];
            if (existingEntry) {
                newData = prev.map((e) => (e.id === id ? {...e, ...entry, open} : e));
            } else {
                newData = [...prev, {...entry, id, open}];
            }
            return newData;
        });
        return id;
    };

    useEffect(() => {Log.info("UIManager entries", entries)}, [entries]);

    const closeUI = (id: string) => {
        const entry = entries.find((e) => e.id === id);
        if (!entry) {
            Log.error("UIManager.closeUI", "No entry found for id", id);
            return;
        }
        setEntries((prev) => {
            const newData = prev.map((e) => (e.id === entry.id ? {...entry, open: false} : e));
            return newData;
        });
    };

    const destroyUI = (id: string) => {
        const entry = entries.find((e) => e.id === id);
        if (!entry) {
            Log.error("UIManager.destroyUI", "No entry found for id", id);
            return;
        }
        setEntries((prev) => {
            const newData = prev.filter((e) => e.id !== entry.id);
            return newData;
        });
    };

    const getUIProps = (id: string) => {
        const entry = entries.find((e) => e.id === id);
        if (!entry) {
            return null;
        }
        return {
            open: entry.open ?? false,
            destroy: () => destroyUI(id),
        };
    }
    return (
        <UIManagerContext.Provider
            value={{entries, createUI, destroyUI, getUIProps, closeUI}}>
            {children}
        </UIManagerContext.Provider>
    );
};

export const useUIManager = () => useContext(UIManagerContext);