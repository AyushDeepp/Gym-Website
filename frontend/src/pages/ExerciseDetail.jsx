import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiActivity,
  FiTarget,
  FiInfo,
  FiPlay,
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
  FiZap,
} from "react-icons/fi";
import { getExercise } from "../utils/api";

const ExerciseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeRepScheme, setActiveRepScheme] = useState("hypertrophy");

  useEffect(() => {
    fetchExercise();
  }, [id]);

  const fetchExercise = async () => {
    setLoading(true);
    try {
      const res = await getExercise(id);
      setExercise(res.data?.exercise);
    } catch (error) {
      console.error("Failed to fetch exercise", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-darker pt-24 pb-16 px-4 sm:px-6 lg:px-12 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-red"></div>
          <p className="text-gray-400 mt-4">Loading exercise details...</p>
        </div>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="min-h-screen bg-primary-darker pt-24 pb-16 px-4 sm:px-6 lg:px-12">
        <div className="max-w-4xl mx-auto text-center py-12">
          <p className="text-gray-400 text-lg">Exercise not found.</p>
          <button
            onClick={() => navigate("/exercises")}
            className="mt-4 px-6 py-3 rounded-full bg-primary-red text-white font-semibold hover:bg-primary-red/90 transition-colors"
          >
            Back to Exercises
          </button>
        </div>
      </div>
    );
  }

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
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/exercises")}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <FiArrowLeft className="text-xl" />
          <span>Back to Exercises</span>
        </motion.button>

        {/* Exercise Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary-gray/70 border border-primary-lightGray rounded-3xl p-6 sm:p-8"
        >
          <div className="flex flex-col md:flex-row gap-6">
            {exercise.imageUrl && (
              <div className="w-full md:w-96 h-64 md:h-80 bg-primary-darker rounded-2xl overflow-hidden flex-shrink-0">
                <img
                  src={exercise.imageUrl}
                  alt={exercise.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
                    {exercise.name}
                  </h1>
                  {exercise.alternativeNames?.length > 0 && (
                    <p className="text-gray-400 text-sm mb-2">
                      Also known as: {exercise.alternativeNames.join(", ")}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 rounded-full bg-primary-red/20 text-primary-red text-sm font-semibold capitalize">
                      {exercise.difficulty}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-primary-darker border border-primary-lightGray text-gray-300 text-sm font-medium capitalize">
                      {muscleGroupLabels[exercise.muscleGroup] || exercise.muscleGroup}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-primary-darker border border-primary-lightGray text-gray-300 text-sm font-medium capitalize">
                      {movementTypeLabels[exercise.movementType] || exercise.movementType}
                    </span>
                    {exercise.exerciseType && (
                      <span className="px-3 py-1 rounded-full bg-primary-darker border border-primary-lightGray text-gray-300 text-sm font-medium capitalize">
                        {exercise.exerciseType}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-gray-300 text-base leading-relaxed mb-6">
                {exercise.description}
              </p>
              {exercise.goals?.length > 0 && (
                <div className="mb-4">
                  <p className="text-gray-400 text-sm mb-2">Goals:</p>
                  <div className="flex flex-wrap gap-2">
                    {exercise.goals.map((goal, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-full bg-primary-darker border border-primary-lightGray text-gray-300 text-sm"
                      >
                        {goal}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Video Section */}
        {exercise.videoUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-primary-gray/70 border border-primary-lightGray rounded-3xl p-6 sm:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <FiPlay className="text-primary-red text-2xl" />
              <h2 className="text-white text-2xl font-bold">Video Tutorial</h2>
            </div>
            <div className="relative w-full bg-primary-darker rounded-2xl overflow-hidden" style={{ paddingBottom: '56.25%' }}>
              {(() => {
                const getYouTubeVideoId = (url) => {
                  if (url.includes('youtube.com/embed/')) {
                    return url.split('youtube.com/embed/')[1].split('?')[0];
                  }
                  if (url.includes('youtu.be/')) {
                    return url.split('youtu.be/')[1].split('?')[0];
                  }
                  const patterns = [
                    /(?:youtube\.com\/watch\?v=|youtube\.com\/v\/)([^&\n?#]+)/,
                    /youtube\.com\/.*[?&]v=([^&\n?#]+)/,
                  ];
                  for (const pattern of patterns) {
                    const match = url.match(pattern);
                    if (match) return match[1];
                  }
                  return null;
                };
                
                const videoId = getYouTubeVideoId(exercise.videoUrl);
                
                if (videoId) {
                  const embedUrl = `https://www.youtube.com/embed/${videoId}`;
                  return (
                    <iframe
                      className="absolute top-0 left-0 w-full h-full"
                      src={embedUrl}
                      title={exercise.name}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    ></iframe>
                  );
                } else {
                  return (
                    <video
                      className="absolute top-0 left-0 w-full h-full object-cover"
                      controls
                      src={exercise.videoUrl}
                    >
                      Your browser does not support the video tag.
                    </video>
                  );
                }
              })()}
            </div>
          </motion.div>
        )}

        {/* Exercise Details Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Muscle Groups */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-primary-gray/70 border border-primary-lightGray rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <FiTarget className="text-primary-red text-2xl" />
              <h2 className="text-white text-xl font-bold">Target Muscles</h2>
            </div>
            <div className="mb-3">
              <p className="text-gray-400 text-sm mb-2">Primary:</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-2 rounded-xl bg-primary-darker border border-primary-lightGray text-white text-sm font-medium capitalize">
                  {muscleGroupLabels[exercise.muscleGroup] || exercise.muscleGroup}
                </span>
              </div>
            </div>
            {exercise.subMuscles?.length > 0 && (
              <div>
                <p className="text-gray-400 text-sm mb-2">Sub-Muscles:</p>
                <div className="flex flex-wrap gap-2">
                  {exercise.subMuscles.map((muscle) => (
                    <span
                      key={muscle}
                      className="px-3 py-2 rounded-xl bg-primary-darker/50 border border-primary-lightGray/50 text-gray-300 text-sm capitalize"
                    >
                      {muscle}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Equipment */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-primary-gray/70 border border-primary-lightGray rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <FiActivity className="text-primary-red text-2xl" />
              <h2 className="text-white text-xl font-bold">Equipment</h2>
            </div>
            {exercise.equipment?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {exercise.equipment.map((equip) => (
                  <span
                    key={equip}
                    className="px-3 py-2 rounded-xl bg-primary-darker border border-primary-lightGray text-white text-sm font-medium capitalize"
                  >
                    {equip}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No equipment needed</p>
            )}
          </motion.div>
        </div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-primary-gray/70 border border-primary-lightGray rounded-2xl p-6 sm:p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <FiActivity className="text-primary-red text-2xl" />
            <h2 className="text-white text-2xl font-bold">How to Perform</h2>
          </div>
          <ol className="space-y-4">
            {exercise.instructions?.map((instruction, index) => (
              <li key={index} className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-red text-white font-bold flex items-center justify-center">
                  {index + 1}
                </span>
                <p className="text-gray-300 leading-relaxed pt-1">{instruction}</p>
              </li>
            ))}
          </ol>
        </motion.div>

        {/* Mind-Muscle Cues */}
        {exercise.cues?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-primary-gray/70 border border-primary-lightGray rounded-2xl p-6 sm:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <FiZap className="text-primary-red text-2xl" />
              <h2 className="text-white text-2xl font-bold">Mind-Muscle Cues</h2>
            </div>
            <ul className="space-y-3">
              {exercise.cues.map((cue, index) => (
                <li key={index} className="flex gap-3">
                  <FiCheckCircle className="text-primary-red text-xl flex-shrink-0 mt-0.5" />
                  <p className="text-gray-300 leading-relaxed">{cue}</p>
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Sets & Reps */}
        {exercise.setsReps && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-primary-gray/70 border border-primary-lightGray rounded-2xl p-6 sm:p-8"
          >
            <h2 className="text-white text-2xl font-bold mb-4">Recommended Sets & Reps</h2>
            <div className="flex gap-3 mb-4">
              {['strength', 'hypertrophy', 'endurance'].map((scheme) => (
                <button
                  key={scheme}
                  onClick={() => setActiveRepScheme(scheme)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors capitalize ${
                    activeRepScheme === scheme
                      ? "bg-primary-red text-white"
                      : "bg-primary-darker border border-primary-lightGray text-gray-300 hover:border-primary-red"
                  }`}
                >
                  {scheme}
                </button>
              ))}
            </div>
            <div className="bg-primary-darker rounded-xl p-6 border border-primary-lightGray">
              <p className="text-gray-400 text-sm mb-2">Recommended:</p>
              <p className="text-white text-3xl font-bold">
                {exercise.setsReps[activeRepScheme] || 'N/A'}
              </p>
            </div>
          </motion.div>
        )}

        {/* Common Mistakes */}
        {exercise.commonMistakes?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-primary-gray/70 border border-primary-lightGray rounded-2xl p-6 sm:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <FiXCircle className="text-primary-red text-2xl" />
              <h2 className="text-white text-2xl font-bold">Common Mistakes</h2>
            </div>
            <ul className="space-y-3">
              {exercise.commonMistakes.map((mistake, index) => (
                <li key={index} className="flex gap-3">
                  <FiXCircle className="text-red-400 text-xl flex-shrink-0 mt-0.5" />
                  <p className="text-gray-300 leading-relaxed">{mistake}</p>
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Variations */}
        {exercise.variations?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-primary-gray/70 border border-primary-lightGray rounded-2xl p-6 sm:p-8"
          >
            <h2 className="text-white text-2xl font-bold mb-4">Exercise Variations</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {exercise.variations.map((variation, index) => (
                <div
                  key={index}
                  className="bg-primary-darker rounded-xl p-4 border border-primary-lightGray"
                >
                  <p className="text-white font-medium">{variation}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Safety Tips */}
        {exercise.safetyTips?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="bg-primary-gray/70 border border-primary-lightGray rounded-2xl p-6 sm:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <FiAlertTriangle className="text-yellow-400 text-2xl" />
              <h2 className="text-white text-2xl font-bold">Safety Tips</h2>
            </div>
            <ul className="space-y-3">
              {exercise.safetyTips.map((tip, index) => (
                <li key={index} className="flex gap-3">
                  <FiAlertTriangle className="text-yellow-400 text-xl flex-shrink-0 mt-0.5" />
                  <p className="text-gray-300 leading-relaxed">{tip}</p>
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Suggested Warmups */}
        {exercise.suggestedWarmups?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-primary-gray/70 border border-primary-lightGray rounded-2xl p-6 sm:p-8"
          >
            <h2 className="text-white text-2xl font-bold mb-4">Suggested Warm-Ups</h2>
            <ul className="space-y-2">
              {exercise.suggestedWarmups.map((warmup, index) => (
                <li key={index} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-red/20 text-primary-red text-xs font-bold flex items-center justify-center mt-0.5">
                    {index + 1}
                  </span>
                  <p className="text-gray-300 leading-relaxed">{warmup}</p>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ExerciseDetail;
