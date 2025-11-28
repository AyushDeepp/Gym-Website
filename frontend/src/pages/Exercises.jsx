import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiFilter, FiX, FiActivity, FiChevronDown } from "react-icons/fi";
import { getExercises, getExerciseCategories } from "../utils/api";

const Exercises = () => {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState([]);
  const [categories, setCategories] = useState({
    muscleGroups: [],
    subMusclesByGroup: {},
    equipment: [],
    difficulties: [],
    goals: [],
    movementTypes: [],
    exerciseTypes: [],
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter states
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState(null);
  const [selectedSubMuscle, setSelectedSubMuscle] = useState(null);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [selectedMovementType, setSelectedMovementType] = useState(null);
  const [selectedExerciseType, setSelectedExerciseType] = useState(null);
  
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchExercises();
  }, [
    selectedMuscleGroup,
    selectedSubMuscle,
    selectedEquipment,
    selectedDifficulty,
    selectedGoal,
    selectedMovementType,
    selectedExerciseType,
    searchTerm,
  ]);

  const fetchCategories = async () => {
    try {
      const res = await getExerciseCategories();
      setCategories(res.data?.categories || {
        muscleGroups: [],
        subMusclesByGroup: {},
        equipment: [],
        difficulties: [],
        goals: [],
        movementTypes: [],
        exerciseTypes: [],
      });
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  };

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const params = {};

      if (selectedMuscleGroup) params.muscleGroup = selectedMuscleGroup;
      if (selectedSubMuscle) params.subMuscle = selectedSubMuscle;
      if (selectedEquipment) params.equipment = selectedEquipment;
      if (selectedDifficulty) params.difficulty = selectedDifficulty;
      if (selectedGoal) params.goal = selectedGoal;
      if (selectedMovementType) params.movementType = selectedMovementType;
      if (selectedExerciseType) params.exerciseType = selectedExerciseType;
      if (searchTerm) params.search = searchTerm;

      const res = await getExercises(params);
      setExercises(res.data?.exercises || []);
    } catch (error) {
      console.error("Failed to fetch exercises", error);
      setExercises([]);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setSelectedMuscleGroup(null);
    setSelectedSubMuscle(null);
    setSelectedEquipment(null);
    setSelectedDifficulty(null);
    setSelectedGoal(null);
    setSelectedMovementType(null);
    setSelectedExerciseType(null);
    setSearchTerm("");
  };

  const hasActiveFilters = () => {
    return (
      selectedMuscleGroup ||
      selectedSubMuscle ||
      selectedEquipment ||
      selectedDifficulty ||
      selectedGoal ||
      selectedMovementType ||
      selectedExerciseType ||
      searchTerm
    );
  };

  const handleExerciseClick = (exerciseId) => {
    navigate(`/exercises/${exerciseId}`);
  };

  const muscleGroupLabels = {
    chest: "Chest",
    back: "Back",
    shoulders: "Shoulders",
    arms: "Arms",
    legs: "Legs",
    core: "Core",
  };

  const movementTypeLabels = {
    push: "Push",
    pull: "Pull",
    squat: "Squat",
    hinge: "Hinge",
    lunge: "Lunge",
    rotation: "Rotation",
    "anti-rotation": "Anti-Rotation",
    carry: "Carry",
    cardio: "Cardio",
    isometric: "Isometric",
  };

  return (
    <div className="min-h-screen bg-primary-darker pt-24 pb-16 px-4 sm:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-sm uppercase tracking-[0.3em] text-primary-red mb-3">
            Exercise Library
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4">
            Find Your Perfect Exercise
          </h1>
          <p className="text-gray-400 max-w-3xl text-base sm:text-lg">
            Browse through our comprehensive exercise database. Filter by muscle
            groups, equipment, difficulty, goals, movement patterns, and more.
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary-gray/70 border border-primary-lightGray rounded-3xl p-5 sm:p-7"
        >
          {/* Search Bar and Filter Button Row */}
          <div className={`flex gap-3 ${showFilters ? 'mb-6' : ''}`}>
            {/* Search Bar */}
            <div className="relative flex-1">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
              <input
                type="text"
                placeholder="Search exercises by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-primary-darker border border-primary-lightGray rounded-xl px-12 py-3.5 text-white placeholder-gray-500 focus:border-primary-red outline-none"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <FiX className="text-xl" />
                </button>
              )}
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-primary-darker border border-primary-lightGray text-gray-300 hover:border-primary-red transition-colors whitespace-nowrap"
            >
              <FiFilter className="text-lg" />
              <span>Filters</span>
              <FiChevronDown
                className={`text-lg transition-transform ${showFilters ? "rotate-180" : ""}`}
              />
            </button>

            {/* Clear Filters Button */}
            {hasActiveFilters() && (
              <button
                onClick={resetFilters}
                className="px-5 py-3.5 rounded-xl bg-primary-red text-white text-sm font-semibold hover:bg-primary-red/90 transition-colors whitespace-nowrap"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-6 pt-4 border-t border-primary-lightGray"
            >
              {/* Muscle Group with Subcategories */}
              <div>
                <label className="text-white font-semibold mb-3 block">
                  Muscle Group
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-3">
                  {categories.muscleGroups.map((group) => (
                    <button
                      key={group}
                      onClick={() => {
                        setSelectedMuscleGroup(
                          selectedMuscleGroup === group ? null : group
                        );
                        setSelectedSubMuscle(null);
                      }}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors capitalize ${
                        selectedMuscleGroup === group
                          ? "bg-primary-red text-white"
                          : "bg-primary-darker border border-primary-lightGray text-gray-300 hover:border-primary-red"
                      }`}
                    >
                      {muscleGroupLabels[group] || group}
                    </button>
                  ))}
                </div>
                {selectedMuscleGroup &&
                  categories.subMusclesByGroup[selectedMuscleGroup]?.length >
                    0 && (
                    <div className="mt-3">
                      <label className="text-gray-400 text-sm mb-2 block">
                        Sub-Muscles ({muscleGroupLabels[selectedMuscleGroup]})
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {categories.subMusclesByGroup[
                          selectedMuscleGroup
                        ].map((subMuscle) => (
                          <button
                            key={subMuscle}
                            onClick={() =>
                              setSelectedSubMuscle(
                                selectedSubMuscle === subMuscle ? null : subMuscle
                              )
                            }
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                              selectedSubMuscle === subMuscle
                                ? "bg-primary-red text-white"
                                : "bg-primary-darker border border-primary-lightGray text-gray-300 hover:border-primary-red"
                            }`}
                          >
                            {subMuscle}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              {/* Equipment */}
              <div>
                <label className="text-white font-semibold mb-3 block">
                  Equipment
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {categories.equipment.map((equip) => (
                    <button
                      key={equip}
                      onClick={() =>
                        setSelectedEquipment(
                          selectedEquipment === equip ? null : equip
                        )
                      }
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors capitalize ${
                        selectedEquipment === equip
                          ? "bg-primary-red text-white"
                          : "bg-primary-darker border border-primary-lightGray text-gray-300 hover:border-primary-red"
                      }`}
                    >
                      {equip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <label className="text-white font-semibold mb-3 block">
                  Difficulty Level
                </label>
                <div className="flex gap-3">
                  {categories.difficulties.map((difficulty) => (
                    <button
                      key={difficulty}
                      onClick={() =>
                        setSelectedDifficulty(
                          selectedDifficulty === difficulty ? null : difficulty
                        )
                      }
                      className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-colors capitalize ${
                        selectedDifficulty === difficulty
                          ? "bg-primary-red text-white"
                          : "bg-primary-darker border border-primary-lightGray text-gray-300 hover:border-primary-red"
                      }`}
                    >
                      {difficulty}
                    </button>
                  ))}
                </div>
              </div>

              {/* Goals */}
              <div>
                <label className="text-white font-semibold mb-3 block">
                  Exercise Goal
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {categories.goals.map((goal) => (
                    <button
                      key={goal}
                      onClick={() =>
                        setSelectedGoal(selectedGoal === goal ? null : goal)
                      }
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        selectedGoal === goal
                          ? "bg-primary-red text-white"
                          : "bg-primary-darker border border-primary-lightGray text-gray-300 hover:border-primary-red"
                      }`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </div>

              {/* Movement Type */}
              <div>
                <label className="text-white font-semibold mb-3 block">
                  Movement Pattern
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {categories.movementTypes.map((movement) => (
                    <button
                      key={movement}
                      onClick={() =>
                        setSelectedMovementType(
                          selectedMovementType === movement ? null : movement
                        )
                      }
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        selectedMovementType === movement
                          ? "bg-primary-red text-white"
                          : "bg-primary-darker border border-primary-lightGray text-gray-300 hover:border-primary-red"
                      }`}
                    >
                      {movementTypeLabels[movement] || movement}
                    </button>
                  ))}
                </div>
              </div>

              {/* Exercise Type */}
              {categories.exerciseTypes.length > 0 && (
                <div>
                  <label className="text-white font-semibold mb-3 block">
                    Exercise Type
                  </label>
                  <div className="flex gap-3">
                    {categories.exerciseTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() =>
                          setSelectedExerciseType(
                            selectedExerciseType === type ? null : type
                          )
                        }
                        className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-colors capitalize ${
                          selectedExerciseType === type
                            ? "bg-primary-red text-white"
                            : "bg-primary-darker border border-primary-lightGray text-gray-300 hover:border-primary-red"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Active Filters Display */}
          {hasActiveFilters() && (
            <div className="mt-6 pt-4 border-t border-primary-lightGray">
              <p className="text-gray-400 text-sm mb-2">Active Filters:</p>
              <div className="flex flex-wrap gap-2">
                {selectedMuscleGroup && (
                  <span className="px-3 py-1 rounded-full bg-primary-red/20 text-primary-red text-xs font-medium">
                    {muscleGroupLabels[selectedMuscleGroup]}
                  </span>
                )}
                {selectedSubMuscle && (
                  <span className="px-3 py-1 rounded-full bg-primary-red/20 text-primary-red text-xs font-medium">
                    {selectedSubMuscle}
                  </span>
                )}
                {selectedEquipment && (
                  <span className="px-3 py-1 rounded-full bg-primary-red/20 text-primary-red text-xs font-medium">
                    {selectedEquipment}
                  </span>
                )}
                {selectedDifficulty && (
                  <span className="px-3 py-1 rounded-full bg-primary-red/20 text-primary-red text-xs font-medium">
                    {selectedDifficulty}
                  </span>
                )}
                {selectedGoal && (
                  <span className="px-3 py-1 rounded-full bg-primary-red/20 text-primary-red text-xs font-medium">
                    {selectedGoal}
                  </span>
                )}
                {selectedMovementType && (
                  <span className="px-3 py-1 rounded-full bg-primary-red/20 text-primary-red text-xs font-medium">
                    {movementTypeLabels[selectedMovementType] || selectedMovementType}
                  </span>
                )}
                {selectedExerciseType && (
                  <span className="px-3 py-1 rounded-full bg-primary-red/20 text-primary-red text-xs font-medium">
                    {selectedExerciseType}
                  </span>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {/* Exercises Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-red"></div>
              <p className="text-gray-400 mt-4">Loading exercises...</p>
            </div>
          ) : exercises.length === 0 ? (
            <div className="text-center py-12 bg-primary-gray/60 border border-primary-lightGray rounded-3xl">
              <FiActivity className="text-6xl text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">
                No exercises found. Try adjusting your filters.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white text-2xl font-bold">
                  {exercises.length} Exercise{exercises.length !== 1 ? "s" : ""} Found
                </h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {exercises.map((exercise) => (
                  <motion.div
                    key={exercise._id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleExerciseClick(exercise._id)}
                    className="bg-primary-gray/70 border border-primary-lightGray rounded-2xl p-5 cursor-pointer hover:border-primary-red transition-colors"
                  >
                    {exercise.imageUrl && (
                      <div className="w-full h-48 bg-primary-darker rounded-xl mb-4 overflow-hidden">
                        <img
                          src={exercise.imageUrl}
                          alt={exercise.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-white font-bold text-lg flex-1">
                        {exercise.name}
                      </h3>
                      <span className="px-2 py-1 rounded-full bg-primary-red/20 text-primary-red text-xs font-semibold capitalize ml-2">
                        {exercise.difficulty}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                      {exercise.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="px-2 py-1 rounded-full bg-primary-darker text-gray-300 text-xs capitalize">
                        {muscleGroupLabels[exercise.muscleGroup] || exercise.muscleGroup}
                      </span>
                      <span className="px-2 py-1 rounded-full bg-primary-darker text-gray-300 text-xs capitalize">
                        {exercise.movementType}
                      </span>
                      <span className="px-2 py-1 rounded-full bg-primary-darker text-gray-300 text-xs capitalize">
                        {exercise.exerciseType}
                      </span>
                    </div>
                    {exercise.equipment?.length > 0 && (
                      <div className="pt-3 border-t border-primary-lightGray">
                        <p className="text-gray-500 text-xs">
                          Equipment: {exercise.equipment.join(", ")}
                        </p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Exercises;
