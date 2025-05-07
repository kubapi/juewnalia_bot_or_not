  <footer className="text-center text-xs text-gray-400 py-4 w-full border-t">
    <p>© 2025 Bot or Not!</p>
  </footer> 

  <div className="fixed inset-0 flex flex-col items-center justify-center bg-gray-900">
    <div className="backdrop-blur-md bg-black/60 p-10 rounded-xl space-y-6">
      <header className="text-center pt-4 px-4 w-full">
        <h1 className="text-3xl sm:text-4xl font-bold mb-1">
          Bot or Not!
        </h1>
      </header>
      <button
        onClick={() => setStarted(true)}
        className="px-14 py-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-3xl font-bold rounded-3xl shadow-2xl hover:scale-105 transition"
      >
        Zacznij grę!
      </button>
    </div>
  </div> 