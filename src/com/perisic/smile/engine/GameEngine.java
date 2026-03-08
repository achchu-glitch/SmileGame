package com.perisic.smile.engine;

import java.net.URL;

/**
 * Main class where the games are coming from. 
 * Basic functionality
 */
public class GameEngine {
	String thePlayer = null;

	/**
	 * Each player has their own game engine.
	 * 
	 * @param player
	 */
	public GameEngine(String player) {
		thePlayer = player;
	}

	int counter = 0;
	int score = 0; 
/*
 * Retrieves a game. This basic version only has two games that alternate.
 * Tries classpath root first, then /assets/ (e.g. when assets folder is on classpath).
 */
	public URL nextGame() {
		URL url;
		if (counter++ % 2 == 0) {
			url = GameEngine.class.getResource("/smile1.png");
			if (url == null) url = GameEngine.class.getResource("/assets/smile1.png");
		} else {
			url = GameEngine.class.getResource("/smile2.png");
			if (url == null) url = GameEngine.class.getResource("/assets/smile2.png");
		}
		return url;
	}

	/**
	 * Checks if the parameter i is a solution to the game URL. If so, score is increased by one. 
	 * @param game
	 * @param i
	 * @return
	 */
	public boolean checkSolution(URL game, int i) {
		if (i == 1) {
			score++; 
			return true;
		} else {
			return false;
		}
	}


	/**
	 * Retrieves the score. 
	 * 
	 * @param player
	 * @return
	 */
	public int getScore() {
		return score;
	}

}
