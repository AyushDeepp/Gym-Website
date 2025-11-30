import { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FiPlayCircle,
  FiLock,
  FiTarget,
  FiFilter,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiX,
  FiSave,
  FiSearch,
  FiEye,
} from "react-icons/fi";
import { CiShare1 } from "react-icons/ci";
import {
  getWorkoutPlans,
  getUserWorkoutPlans,
  createUserWorkoutPlan,
  updateUserWorkoutPlan,
  deleteUserWorkoutPlan,
  addExerciseToUserPlan,
  getExercise,
  getExercises,
} from "../utils/api";
import { useAuth } from "../context/AuthContext";

const WorkoutCard = ({ plan, isUserPlan, onEdit, onDelete, onView }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-primary-gray border border-primary-lightGray rounded-3xl p-5 flex flex-col gap-4 relative overflow-hidden cursor-pointer hover:border-primary-red/50 transition-colors"
    onClick={onView}
  >
    <div className="flex items-center justify-between gap-3">
      <div className="flex-1">
        <p className="text-xs uppercase tracking-[0.3em] text-primary-red">
          {plan.goal || "Custom Plan"}
        </p>
        <h3 className="text-white text-xl font-bold">{plan.title}</h3>
      </div>
      <div className="flex items-center gap-2">
        {isUserPlan && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(plan);
              }}
              className="p-2 rounded-lg bg-primary-darker border border-primary-lightGray text-gray-300 hover:text-primary-red hover:border-primary-red transition-colors"
              title="Edit plan"
            >
              <FiEdit className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(plan._id);
              }}
              className="p-2 rounded-lg bg-primary-darker border border-primary-lightGray text-gray-300 hover:text-red-400 hover:border-red-400 transition-colors"
              title="Delete plan"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          </>
        )}
        {!isUserPlan && (
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              plan.access === "public"
                ? "bg-green-500/20 text-green-300"
                : plan.access === "members"
                ? "bg-blue-500/20 text-blue-200"
                : "bg-purple-500/20 text-purple-200"
            }`}
          >
            {plan.access}
          </span>
        )}
      </div>
    </div>
    {plan.imageUrl && (
      <img
        src={plan.imageUrl}
        alt={plan.title}
        className="w-full h-44 object-cover rounded-2xl border border-primary-lightGray/60"
      />
    )}
    <div className="space-y-3">
      {plan.level && (
        <p className="text-gray-400 text-sm">
          Level: <span className="text-white capitalize">{plan.level}</span>
        </p>
      )}
      {plan.description && (
        <p className="text-gray-400 text-sm">{plan.description}</p>
      )}
      <div className="space-y-2">
        {plan.exercises?.slice(0, 4).map((exercise, idx) => (
          <div
            key={`${plan._id}-${exercise.name || exercise.exerciseId}-${idx}`}
            className="flex items-center gap-3 text-sm text-gray-300"
          >
            <span className="w-6 h-6 rounded-full bg-primary-darker flex items-center justify-center text-xs text-gray-400">
              {idx + 1}
            </span>
            <div className="flex-1">
              <p className="text-white font-medium">{exercise.name}</p>
              <p className="text-gray-400 text-xs">
                {exercise.sets} sets • {exercise.reps}
              </p>
            </div>
            {exercise.videoUrl && (
              <a
                href={exercise.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="text-primary-red text-xs font-semibold flex items-center gap-1"
              >
                <FiPlayCircle /> Demo
              </a>
            )}
          </div>
        ))}
        {plan.exercises?.length > 4 && (
          <p className="text-gray-500 text-xs">
            + {plan.exercises.length - 4} more drills
          </p>
        )}
        {(!plan.exercises || plan.exercises.length === 0) && (
          <p className="text-gray-500 text-xs italic">No exercises added yet</p>
        )}
      </div>
    </div>
  </motion.div>
);

const ViewPlanModal = ({ isOpen, onClose, plan }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleExerciseClick = (exerciseId, e) => {
    e.stopPropagation();
    if (exerciseId) {
      navigate(`/exercises/${exerciseId}`);
      onClose();
    }
  };

  if (!plan) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          >
            <div className="bg-primary-darker border border-primary-lightGray rounded-3xl p-4 sm:p-6 lg:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white break-words">
                  {plan.title}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-primary-gray transition-colors flex-shrink-0"
                >
                  <FiX className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                </button>
              </div>

              <div className="space-y-4 sm:space-y-6">
                {plan.imageUrl && (
                  <img
                    src={plan.imageUrl}
                    alt={plan.title}
                    className="w-full h-40 sm:h-48 object-cover rounded-2xl border border-primary-lightGray/60"
                  />
                )}

                <div className="space-y-3 sm:space-y-4">
                  {plan.goal && (
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-primary-red mb-1">
                        Goal
                      </p>
                      <p className="text-white font-medium text-sm sm:text-base">
                        {plan.goal}
                      </p>
                    </div>
                  )}

                  {plan.level && (
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-primary-red mb-1">
                        Level
                      </p>
                      <p className="text-white font-medium capitalize text-sm sm:text-base">
                        {plan.level}
                      </p>
                    </div>
                  )}

                  {plan.description && (
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-primary-red mb-1">
                        Description
                      </p>
                      <p className="text-gray-300 text-sm sm:text-base">
                        {plan.description}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-primary-red mb-2 sm:mb-3">
                      Exercises ({plan.exercises?.length || 0})
                    </p>
                    {plan.exercises && plan.exercises.length > 0 ? (
                      <div className="space-y-2 sm:space-y-3">
                        {plan.exercises.map((exercise, idx) => (
                          <div
                            key={idx}
                            className="bg-primary-gray border border-primary-lightGray rounded-xl p-3 sm:p-4"
                          >
                            <div className="flex items-start justify-between gap-2 sm:gap-3">
                              <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                                <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary-red/20 text-primary-red flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">
                                  {idx + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2 mb-1">
                                    <p className="text-white font-semibold text-sm sm:text-base break-words">
                                      {exercise.name}
                                    </p>
                                    {exercise.exerciseId && (
                                      <button
                                        onClick={(e) =>
                                          handleExerciseClick(
                                            exercise.exerciseId,
                                            e
                                          )
                                        }
                                        className="text-primary-red hover:text-primary-red/80 transition-colors flex items-center gap-1 text-xs sm:text-sm font-medium flex-shrink-0"
                                        title="View exercise details"
                                      >
                                        <CiShare1 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                        <span className="hidden sm:inline">
                                          View
                                        </span>
                                      </button>
                                    )}
                                  </div>
                                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-400">
                                    <span>{exercise.sets || 0} sets</span>
                                    <span className="hidden sm:inline">•</span>
                                    <span>{exercise.reps || "N/A"} reps</span>
                                    {exercise.restTime && (
                                      <>
                                        <span className="hidden sm:inline">
                                          •
                                        </span>
                                        <span>{exercise.restTime} rest</span>
                                      </>
                                    )}
                                  </div>
                                  {exercise.notes && (
                                    <p className="text-gray-400 text-xs sm:text-sm mt-2 italic break-words">
                                      {exercise.notes}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-xs sm:text-sm italic">
                        No exercises added yet
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

const CreatePlanModal = ({
  isOpen,
  onClose,
  onSave,
  exerciseToAdd,
  userPlans,
  onAddToExisting,
  editingPlan,
  initialData,
}) => {
  const [formData, setFormData] = useState(
    initialData || {
      title: "",
      description: "",
      goal: "",
      level: "beginner",
      exercises: [],
    }
  );
  const [exerciseSearch, setExerciseSearch] = useState("");
  const [exerciseResults, setExerciseResults] = useState([]);
  const [showExerciseSearch, setShowExerciseSearch] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [editingExerciseIndex, setEditingExerciseIndex] = useState(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          ...initialData,
          exercises: initialData.exercises || [],
        });
      } else {
        setFormData({
          title: "",
          description: "",
          goal: "",
          level: "beginner",
          exercises: exerciseToAdd
            ? [
                {
                  exerciseId: exerciseToAdd._id,
                  name: exerciseToAdd.name,
                  sets: 3,
                  reps: exerciseToAdd.setsReps?.hypertrophy || "8-12",
                  restTime: "60-90 seconds",
                  notes: "",
                },
              ]
            : [],
        });
      }
      setExerciseSearch("");
      setExerciseResults([]);
      setShowExerciseSearch(false);
      setEditingExerciseIndex(null);
    }
  }, [isOpen, initialData, exerciseToAdd]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (exerciseSearch.trim().length > 2) {
      const timeoutId = setTimeout(() => {
        searchExercises();
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setExerciseResults([]);
    }
  }, [exerciseSearch]);

  const searchExercises = async () => {
    try {
      setSearchLoading(true);
      const res = await getExercises({ search: exerciseSearch, limit: 10 });
      setExerciseResults(res.data?.exercises || []);
    } catch (error) {
      console.error("Failed to search exercises", error);
      setExerciseResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleAddExercise = (exercise) => {
    const newExercise = {
      exerciseId: exercise._id,
      name: exercise.name,
      sets: 3,
      reps: exercise.setsReps?.hypertrophy || "8-12",
      restTime: "60-90 seconds",
      notes: "",
    };
    setFormData({
      ...formData,
      exercises: [...(formData.exercises || []), newExercise],
    });
    setExerciseSearch("");
    setExerciseResults([]);
    setShowExerciseSearch(false);
  };

  const handleRemoveExercise = (index) => {
    const updatedExercises = formData.exercises.filter((_, i) => i !== index);
    setFormData({ ...formData, exercises: updatedExercises });
    if (editingExerciseIndex === index) {
      setEditingExerciseIndex(null);
    }
  };

  const handleUpdateExercise = (index, field, value) => {
    const updatedExercises = [...formData.exercises];
    updatedExercises[index] = { ...updatedExercises[index], [field]: value };
    setFormData({ ...formData, exercises: updatedExercises });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onSave(formData);
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          >
            <div className="bg-primary-darker border border-primary-lightGray rounded-3xl p-4 sm:p-6 lg:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                  {editingPlan
                    ? "Edit Workout Plan"
                    : exerciseToAdd
                    ? "Add Exercise to Workout Plan"
                    : "Create New Workout Plan"}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-primary-gray transition-colors"
                >
                  <FiX className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              {exerciseToAdd && userPlans.length > 0 && (
                <div className="mb-6">
                  <p className="text-gray-400 text-sm mb-3">
                    Or add to existing plan:
                  </p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {userPlans.map((plan) => (
                      <button
                        key={plan._id}
                        onClick={() => onAddToExisting(plan._id)}
                        className="w-full text-left p-3 rounded-xl bg-primary-gray border border-primary-lightGray hover:border-primary-red transition-colors"
                      >
                        <p className="text-white font-medium">{plan.title}</p>
                        <p className="text-gray-400 text-xs">
                          {plan.exercises?.length || 0} exercises
                        </p>
                      </button>
                    ))}
                  </div>
                  <div className="my-4 flex items-center gap-4">
                    <div className="flex-1 h-px bg-primary-lightGray" />
                    <span className="text-gray-500 text-sm">OR</span>
                    <div className="flex-1 h-px bg-primary-lightGray" />
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <div>
                  <label className="text-gray-400 text-xs sm:text-sm block mb-1.5 sm:mb-2">
                    Plan Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full bg-primary-gray border border-primary-lightGray rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-white focus:border-primary-red outline-none"
                    placeholder="e.g., Push Day, Leg Day, Full Body"
                    required
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-xs sm:text-sm block mb-1.5 sm:mb-2">
                    Goal
                  </label>
                  <input
                    type="text"
                    value={formData.goal}
                    onChange={(e) =>
                      setFormData({ ...formData, goal: e.target.value })
                    }
                    className="w-full bg-primary-gray border border-primary-lightGray rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-white focus:border-primary-red outline-none"
                    placeholder="e.g., Muscle Building, Strength, Fat Loss"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-xs sm:text-sm block mb-1.5 sm:mb-2">
                    Level
                  </label>
                  <select
                    value={formData.level}
                    onChange={(e) =>
                      setFormData({ ...formData, level: e.target.value })
                    }
                    className="w-full bg-primary-gray border border-primary-lightGray rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-white focus:border-primary-red outline-none"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-xs sm:text-sm block mb-1.5 sm:mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows="3"
                    className="w-full bg-primary-gray border border-primary-lightGray rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-white focus:border-primary-red outline-none resize-none"
                    placeholder="Optional description..."
                  />
                </div>

                {/* Exercises Section */}
                <div className="border-t border-primary-lightGray pt-3 sm:pt-4">
                  <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
                    <label className="text-gray-400 text-xs sm:text-sm">
                      Exercises
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowExerciseSearch(!showExerciseSearch)}
                      className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-primary-red/20 border border-primary-red text-primary-red text-xs sm:text-sm font-semibold hover:bg-primary-red/30 transition-colors flex items-center gap-1.5 sm:gap-2 flex-shrink-0"
                    >
                      <FiPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="hidden xs:inline">Add Exercise</span>
                      <span className="xs:hidden">Add</span>
                    </button>
                  </div>

                  {/* Exercise Search */}
                  {showExerciseSearch && (
                    <div className="mb-4 relative">
                      <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          value={exerciseSearch}
                          onChange={(e) => setExerciseSearch(e.target.value)}
                          className="w-full bg-primary-gray border border-primary-lightGray rounded-xl pl-10 pr-4 py-2.5 text-white focus:border-primary-red outline-none"
                          placeholder="Search exercises..."
                          autoFocus
                        />
                      </div>
                      {exerciseResults.length > 0 && (
                        <div className="absolute z-10 w-full mt-2 bg-primary-gray border border-primary-lightGray rounded-xl max-h-60 overflow-y-auto">
                          {exerciseResults.map((exercise) => (
                            <button
                              key={exercise._id}
                              type="button"
                              onClick={() => handleAddExercise(exercise)}
                              className="w-full text-left p-3 hover:bg-primary-darker border-b border-primary-lightGray last:border-b-0 transition-colors"
                            >
                              <p className="text-white font-medium">
                                {exercise.name}
                              </p>
                              <p className="text-gray-400 text-xs mt-1">
                                {exercise.muscleGroup} •{" "}
                                {exercise.equipment?.join(", ") || "Bodyweight"}
                              </p>
                            </button>
                          ))}
                        </div>
                      )}
                      {searchLoading && (
                        <div className="absolute z-10 w-full mt-2 bg-primary-gray border border-primary-lightGray rounded-xl p-3 text-center text-gray-400 text-sm">
                          Searching...
                        </div>
                      )}
                      {exerciseSearch.trim().length > 2 &&
                        !searchLoading &&
                        exerciseResults.length === 0 && (
                          <div className="absolute z-10 w-full mt-2 bg-primary-gray border border-primary-lightGray rounded-xl p-3 text-center text-gray-400 text-sm">
                            No exercises found
                          </div>
                        )}
                    </div>
                  )}

                  {/* Exercise List */}
                  {formData.exercises && formData.exercises.length > 0 && (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {formData.exercises.map((exercise, index) => (
                        <div
                          key={index}
                          className="bg-primary-gray border border-primary-lightGray rounded-xl p-3 sm:p-4"
                        >
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-medium text-sm sm:text-base break-words">
                                {exercise.name}
                              </p>
                              {editingExerciseIndex === index ? (
                                <div className="mt-3 space-y-2">
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    <div>
                                      <label className="text-gray-400 text-xs block mb-1">
                                        Sets
                                      </label>
                                      <input
                                        type="number"
                                        min="1"
                                        value={exercise.sets || ""}
                                        onChange={(e) =>
                                          handleUpdateExercise(
                                            index,
                                            "sets",
                                            parseInt(e.target.value) || 0
                                          )
                                        }
                                        className="w-full bg-primary-darker border border-primary-lightGray rounded-lg px-2 py-1.5 text-white text-sm focus:border-primary-red outline-none"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-gray-400 text-xs block mb-1">
                                        Reps
                                      </label>
                                      <input
                                        type="text"
                                        value={exercise.reps || ""}
                                        onChange={(e) =>
                                          handleUpdateExercise(
                                            index,
                                            "reps",
                                            e.target.value
                                          )
                                        }
                                        className="w-full bg-primary-darker border border-primary-lightGray rounded-lg px-2 py-1.5 text-white text-sm focus:border-primary-red outline-none"
                                        placeholder="8-12"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-gray-400 text-xs block mb-1">
                                        Rest
                                      </label>
                                      <input
                                        type="text"
                                        value={exercise.restTime || ""}
                                        onChange={(e) =>
                                          handleUpdateExercise(
                                            index,
                                            "restTime",
                                            e.target.value
                                          )
                                        }
                                        className="w-full bg-primary-darker border border-primary-lightGray rounded-lg px-2 py-1.5 text-white text-sm focus:border-primary-red outline-none"
                                        placeholder="60-90s"
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-gray-400 text-xs block mb-1">
                                      Notes (optional)
                                    </label>
                                    <input
                                      type="text"
                                      value={exercise.notes || ""}
                                      onChange={(e) =>
                                        handleUpdateExercise(
                                          index,
                                          "notes",
                                          e.target.value
                                        )
                                      }
                                      className="w-full bg-primary-darker border border-primary-lightGray rounded-lg px-2 py-1.5 text-white text-sm focus:border-primary-red outline-none"
                                      placeholder="Optional notes..."
                                    />
                                  </div>
                                </div>
                              ) : (
                                <div className="mt-2 flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-gray-400">
                                  <span>{exercise.sets || 0} sets</span>
                                  <span className="hidden sm:inline">•</span>
                                  <span>{exercise.reps || "N/A"} reps</span>
                                  {exercise.restTime && (
                                    <>
                                      <span className="hidden sm:inline">
                                        •
                                      </span>
                                      <span>{exercise.restTime} rest</span>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2 ml-2 sm:ml-3 flex-shrink-0">
                              <button
                                type="button"
                                onClick={() =>
                                  setEditingExerciseIndex(
                                    editingExerciseIndex === index
                                      ? null
                                      : index
                                  )
                                }
                                className="p-1.5 rounded-lg bg-primary-darker border border-primary-lightGray text-gray-300 hover:text-primary-red hover:border-primary-red transition-colors"
                                title={
                                  editingExerciseIndex === index
                                    ? "Save"
                                    : "Edit"
                                }
                              >
                                <FiEdit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveExercise(index)}
                                className="p-1.5 rounded-lg bg-primary-darker border border-primary-lightGray text-gray-300 hover:text-red-400 hover:border-red-400 transition-colors"
                                title="Remove"
                              >
                                <FiTrash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {(!formData.exercises || formData.exercises.length === 0) && (
                    <div className="text-center py-6 text-gray-400 text-sm border border-primary-lightGray rounded-xl border-dashed">
                      No exercises added yet. Click "Add Exercise" to search and
                      add exercises.
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-primary-lightGray text-gray-300 hover:border-primary-red transition-colors text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-primary-red text-white font-semibold hover:bg-primary-red/90 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <FiSave className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    {editingPlan ? "Update Plan" : "Create Plan"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

const DashboardWorkouts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const exerciseIdToAdd = searchParams.get("addExercise");

  const [plans, setPlans] = useState([]);
  const [userPlans, setUserPlans] = useState([]);
  const [previewPlans, setPreviewPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [exerciseToAdd, setExerciseToAdd] = useState(null);
  const [editingPlan, setEditingPlan] = useState(null);
  const [viewingPlan, setViewingPlan] = useState(null);

  useEffect(() => {
    if (exerciseIdToAdd && user) {
      fetchExerciseToAdd();
    }
  }, [exerciseIdToAdd, user]);

  useEffect(() => {
    fetchPlans();
  }, [user]);

  const fetchExerciseToAdd = async () => {
    try {
      const res = await getExercise(exerciseIdToAdd);
      setExerciseToAdd(res.data?.exercise);
      setShowCreateModal(true);
      // Remove query param
      navigate("/dashboard/workouts", { replace: true });
    } catch (error) {
      console.error("Failed to fetch exercise", error);
    }
  };

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const [fullRes, previewRes, userPlansRes] = await Promise.all([
        getWorkoutPlans(),
        getWorkoutPlans({ params: { preview: true } }),
        user
          ? getUserWorkoutPlans(user._id).catch(() => ({ data: { plans: [] } }))
          : Promise.resolve({ data: { plans: [] } }),
      ]);
      setPlans(fullRes.data || []);
      setPreviewPlans(previewRes.data?.plans || []);
      setUserPlans(userPlansRes.data?.plans || []);
    } catch (error) {
      console.error("Workout load failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async (formData) => {
    try {
      const newPlan = await createUserWorkoutPlan({
        ...formData,
        exercises: formData.exercises || [],
      });
      setUserPlans([...userPlans, newPlan.data.plan]);
      setShowCreateModal(false);
      setExerciseToAdd(null);
      setEditingPlan(null);
    } catch (error) {
      console.error("Failed to create plan", error);
      alert("Failed to create workout plan");
    }
  };

  const handleAddToExisting = async (planId) => {
    if (!exerciseToAdd) return;
    try {
      await addExerciseToUserPlan(planId, {
        exerciseId: exerciseToAdd._id,
        name: exerciseToAdd.name,
        sets: 3,
        reps: exerciseToAdd.setsReps?.hypertrophy || "8-12",
        restTime: "60-90 seconds",
      });
      await fetchPlans();
      setShowCreateModal(false);
      setExerciseToAdd(null);
      alert("Exercise added to workout plan!");
    } catch (error) {
      console.error("Failed to add exercise", error);
      alert("Failed to add exercise to plan");
    }
  };

  const handleEditPlan = (plan) => {
    setEditingPlan(plan);
    setShowCreateModal(true);
  };

  const handleUpdatePlan = async (formData) => {
    try {
      await updateUserWorkoutPlan(editingPlan._id, formData);
      await fetchPlans();
      setShowCreateModal(false);
      setEditingPlan(null);
    } catch (error) {
      console.error("Failed to update plan", error);
      alert("Failed to update workout plan");
    }
  };

  const handleDeletePlan = async (planId) => {
    if (!window.confirm("Are you sure you want to delete this workout plan?"))
      return;
    try {
      await deleteUserWorkoutPlan(planId);
      setUserPlans(userPlans.filter((p) => p._id !== planId));
    } catch (error) {
      console.error("Failed to delete plan", error);
      alert("Failed to delete workout plan");
    }
  };

  const filteredPlans = useMemo(() => {
    if (filter === "all") {
      return plans;
    } else if (filter === "custom") {
      return [];
    } else {
      return plans.filter((plan) => plan.access === filter);
    }
  }, [plans, filter]);

  return (
    <div className="min-h-screen bg-primary-darker pt-24 pb-16 px-4 sm:px-6 lg:px-12">
      <div className="max-w-6xl mx-auto space-y-10 sm:space-y-12">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-primary-red mb-3">
              Workout Library
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
              My Workout Plans
            </h1>
            <p className="text-gray-400 text-sm sm:text-base max-w-2xl">
              {user?.role === "member"
                ? "View assigned programs and create your own custom workout plans."
                : "Create and manage your custom workout plans. Add exercises from the exercise library."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <button
                onClick={() => {
                  setExerciseToAdd(null);
                  setEditingPlan(null);
                  setShowCreateModal(true);
                }}
                className="px-5 py-2.5 rounded-full bg-primary-red text-white text-sm font-semibold hover:bg-primary-red/90 transition-colors flex items-center gap-2"
              >
                <FiPlus className="w-4 h-4" />
                Create Plan
              </button>
            )}
            {user && (
              <div className="bg-primary-gray border border-primary-lightGray rounded-2xl p-4 flex items-center gap-3">
                <FiTarget className="text-primary-red text-xl" />
                <div>
                  <p className="text-white text-sm font-semibold">
                    Active Role
                  </p>
                  <p className="text-gray-400 text-xs capitalize">
                    {user?.role || "visitor"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {user && (
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <FiFilter />
              Filter
            </div>
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                filter === "all"
                  ? "border-primary-red text-white bg-primary-red/20"
                  : "border-primary-lightGray text-gray-400 hover:border-primary-red/50"
              }`}
            >
              All Plans
            </button>
            {userPlans.length > 0 && (
              <button
                onClick={() => setFilter("custom")}
                className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                  filter === "custom"
                    ? "border-primary-red text-white bg-primary-red/20"
                    : "border-primary-lightGray text-gray-400 hover:border-primary-red/50"
                }`}
              >
                Custom Plans
              </button>
            )}
            {user?.role === "member" &&
              ["public", "members", "assigned"].map((key) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-4 py-2 rounded-full text-sm capitalize border transition-colors ${
                    filter === key
                      ? "border-primary-red text-white bg-primary-red/20"
                      : "border-primary-lightGray text-gray-400 hover:border-primary-red/50"
                  }`}
                >
                  {key}
                </button>
              ))}
          </div>
        )}

        {/* Custom Plans Section */}
        {user &&
          userPlans.length > 0 &&
          (filter === "all" || filter === "custom") && (
            <section>
              <h2 className="text-white text-xl font-bold mb-4">
                My Custom Plans
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                {userPlans.map((plan) => (
                  <WorkoutCard
                    key={plan._id}
                    plan={plan}
                    isUserPlan={true}
                    onEdit={handleEditPlan}
                    onDelete={handleDeletePlan}
                    onView={() => setViewingPlan(plan)}
                  />
                ))}
              </div>
            </section>
          )}

        {/* Assigned & Available Plans Section */}
        {user?.role === "member" &&
          (filter === "all" ||
            (filter !== "custom" && filteredPlans.length > 0)) && (
            <section>
              <h2 className="text-white text-xl font-bold mb-4">
                {filter === "all"
                  ? "Assigned & Available Plans"
                  : "Available Plans"}
              </h2>
              {filteredPlans.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {filteredPlans.map((plan) => (
                    <WorkoutCard
                      key={plan._id}
                      plan={plan}
                      isUserPlan={false}
                      onView={() => setViewingPlan(plan)}
                    />
                  ))}
                </div>
              ) : filter !== "all" && filter !== "custom" ? (
                <div className="bg-primary-gray border border-primary-lightGray rounded-2xl p-6 text-center">
                  <p className="text-gray-400">
                    No plans found for this filter.
                  </p>
                </div>
              ) : null}
            </section>
          )}

        {!user && (
          <section className="bg-primary-gray/60 border border-primary-lightGray rounded-3xl p-5 sm:p-7">
            <div className="flex items-center justify-between flex-wrap gap-4 mb-5">
              <div>
                <h2 className="text-white text-2xl font-bold flex items-center gap-2">
                  <FiLock className="text-primary-red" /> Visitor Preview
                </h2>
                <p className="text-gray-400 text-sm">
                  Sign up to create and manage your own workout plans.
                </p>
              </div>
              <a
                href="/plans"
                className="px-5 py-2.5 rounded-full bg-primary-red text-white text-sm font-semibold hover:bg-primary-red/90 transition-colors"
              >
                Get Started
              </a>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {previewPlans.slice(0, 4).map((plan) => (
                <div
                  key={plan._id}
                  className="bg-primary-darker border border-primary-lightGray rounded-2xl p-4"
                >
                  <h4 className="text-white font-semibold mb-2">
                    {plan.title}
                  </h4>
                  <p className="text-gray-400 text-xs mb-2">{plan.goal}</p>
                  <p className="text-xs text-gray-500">
                    {plan.totalExercises} exercises • locked
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {loading && (
          <div className="text-gray-400 text-center py-12">
            Loading plans...
          </div>
        )}

        {!loading &&
          user &&
          userPlans.length === 0 &&
          (filter === "all"
            ? filteredPlans.length === 0
            : filter === "custom") && (
            <div className="bg-primary-gray border border-primary-lightGray rounded-2xl p-6 text-center">
              <p className="text-gray-400 mb-4">
                {filter === "custom"
                  ? "No custom plans yet."
                  : "No workout plans yet."}
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-5 py-2.5 rounded-full bg-primary-red text-white text-sm font-semibold hover:bg-primary-red/90 transition-colors"
              >
                Create Your First Plan
              </button>
            </div>
          )}

        <ViewPlanModal
          isOpen={!!viewingPlan}
          onClose={() => setViewingPlan(null)}
          plan={viewingPlan}
        />
        <CreatePlanModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setExerciseToAdd(null);
            setEditingPlan(null);
          }}
          onSave={editingPlan ? handleUpdatePlan : handleCreatePlan}
          exerciseToAdd={exerciseToAdd}
          userPlans={userPlans}
          onAddToExisting={handleAddToExisting}
          editingPlan={editingPlan}
          initialData={
            editingPlan
              ? {
                  title: editingPlan.title,
                  description: editingPlan.description || "",
                  goal: editingPlan.goal || "",
                  level: editingPlan.level || "beginner",
                  exercises: editingPlan.exercises || [],
                }
              : null
          }
        />
      </div>
    </div>
  );
};

export default DashboardWorkouts;
