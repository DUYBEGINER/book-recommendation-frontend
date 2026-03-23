import { useContext } from "react";
import { GenreContext } from "../contexts/Genre/GenreContext";

const useGenres = () => {
    const context = useContext(GenreContext);
    if (!context) {
        throw new Error("useGenres must be used within a GenreProvider");
    }
    return context;
}

export default useGenres;