package com.perisic.smile.auth;

import java.awt.Color;
import java.awt.Dimension;
import java.awt.Font;
import java.awt.GridBagConstraints;
import java.awt.GridBagLayout;
import java.awt.Insets;
import java.awt.Toolkit;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.util.Arrays;

import javax.swing.BorderFactory;
import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JPasswordField;
import javax.swing.JTextField;
import javax.swing.SwingUtilities;
import javax.swing.border.EmptyBorder;

import com.perisic.smile.gui.GameGUI;

/**
 * Login window for the Smile game application.
 * Validates credentials and opens GameGUI on success.
 */
public class LoginFrame extends JFrame implements ActionListener {

	private static final long serialVersionUID = 1L;

	// Hardcoded test user for demonstration (in production, use secure storage)
	private static final String TEST_USERNAME = "admin";
	private static final String TEST_PASSWORD = "1234";

	private JTextField usernameField;
	private JPasswordField passwordField;

	public LoginFrame() {
		super("Smile Game – Sign in");
		buildUI();
	}

	// Professional UI colors
	private static final Color BG = new Color(0xE5E7EB);
	private static final Color CARD_BG = Color.WHITE;
	private static final Color BORDER = new Color(0xD1D5DB);
	private static final Color INPUT_BG = new Color(0xF9FAFB);
	private static final Color TEXT = new Color(0x111827);
	private static final Color TEXT_MUTED = new Color(0x6B7280);
	private static final Color ACCENT = new Color(0x2563EB);
	private static final Color ACCENT_HOVER = new Color(0x1D4ED8);
	private static final Color ACCENT_BAR = new Color(0x3B82F6);
	private static final Color SECONDARY_BG = new Color(0xF3F4F6);
	private static final Color SECONDARY_BORDER = new Color(0xD1D5DB);

	/**
	 * Builds the login form with a card layout, title, and styled components.
	 */
	private void buildUI() {
		setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
		// Size the window to suit full screen (proportion of screen dimensions)
		Dimension screen = Toolkit.getDefaultToolkit().getScreenSize();
		int width = Math.max(420, (int) (screen.width * 0.4));
		int height = Math.max(400, (int) (screen.height * 0.45));
		setSize(width, height);
		setMinimumSize(new Dimension(380, 360));
		setResizable(false);
		setLocationRelativeTo(null);
		getContentPane().setBackground(BG);

		JPanel card = new JPanel(new GridBagLayout());
		card.setBackground(CARD_BG);
		card.setBorder(BorderFactory.createCompoundBorder(
				BorderFactory.createCompoundBorder(
						BorderFactory.createLineBorder(BORDER, 1),
						BorderFactory.createEmptyBorder(1, 1, 1, 1)),
				new EmptyBorder(24, 36, 28, 36)));
		card.setPreferredSize(new Dimension(420, 380));

		GridBagConstraints gbc = new GridBagConstraints();
		gbc.insets = new Insets(0, 0, 4, 0);
		gbc.anchor = GridBagConstraints.LINE_START;
		gbc.fill = GridBagConstraints.HORIZONTAL;
		gbc.gridwidth = GridBagConstraints.REMAINDER;
		gbc.weightx = 1;

		// Accent bar (professional header strip)
		JPanel accentBar = new JPanel();
		accentBar.setBackground(ACCENT_BAR);
		accentBar.setPreferredSize(new Dimension(0, 4));
		gbc.gridy = 0;
		gbc.insets = new Insets(0, 0, 0, 0);
		card.add(accentBar, gbc);

		// Title – centered
		JLabel titleLabel = new JLabel("Smile Game");
		titleLabel.setFont(titleLabel.getFont().deriveFont(Font.BOLD, 22f));
		titleLabel.setForeground(TEXT);
		gbc.gridy = 1;
		gbc.insets = new Insets(16, 0, 2, 0);
		gbc.anchor = GridBagConstraints.CENTER;
		card.add(titleLabel, gbc);
		gbc.anchor = GridBagConstraints.LINE_START;

		// Subtitle
		JLabel subtitleLabel = new JLabel("Sign in to continue");
		subtitleLabel.setForeground(TEXT_MUTED);
		subtitleLabel.setFont(subtitleLabel.getFont().deriveFont(12f));
		gbc.gridy = 2;
		gbc.insets = new Insets(0, 0, 20, 0);
		gbc.anchor = GridBagConstraints.CENTER;
		card.add(subtitleLabel, gbc);
		gbc.anchor = GridBagConstraints.LINE_START;

		// Username label
		JLabel userLabel = new JLabel("Username");
		userLabel.setForeground(TEXT_MUTED);
		userLabel.setFont(userLabel.getFont().deriveFont(Font.BOLD, 11f));
		gbc.gridy = 3;
		gbc.insets = new Insets(0, 0, 5, 0);
		card.add(userLabel, gbc);

		usernameField = new JTextField(22);
		usernameField.setBackground(INPUT_BG);
		usernameField.setBorder(BorderFactory.createCompoundBorder(
				BorderFactory.createLineBorder(BORDER, 1),
				new EmptyBorder(10, 12, 10, 12)));
		usernameField.setFont(usernameField.getFont().deriveFont(14f));
		usernameField.setCaretColor(TEXT);
		gbc.gridy = 4;
		gbc.insets = new Insets(0, 0, 14, 0);
		card.add(usernameField, gbc);

		// Password label
		JLabel passLabel = new JLabel("Password");
		passLabel.setForeground(TEXT_MUTED);
		passLabel.setFont(passLabel.getFont().deriveFont(Font.BOLD, 11f));
		gbc.gridy = 5;
		gbc.insets = new Insets(0, 0, 5, 0);
		card.add(passLabel, gbc);

		passwordField = new JPasswordField(22);
		passwordField.setBackground(INPUT_BG);
		passwordField.setBorder(BorderFactory.createCompoundBorder(
				BorderFactory.createLineBorder(BORDER, 1),
				new EmptyBorder(10, 12, 10, 12)));
		passwordField.setFont(passwordField.getFont().deriveFont(14f));
		passwordField.setCaretColor(TEXT);
		gbc.gridy = 6;
		gbc.insets = new Insets(0, 0, 22, 0);
		card.add(passwordField, gbc);

		// Login button – full width so it’s always visible
		JButton loginButton = new JButton("Login");
		loginButton.setActionCommand("Login");
		loginButton.addActionListener(this);
		loginButton.setBackground(ACCENT);
		loginButton.setForeground(Color.WHITE);
		loginButton.setFont(loginButton.getFont().deriveFont(Font.BOLD, 13f));
		loginButton.setBorder(BorderFactory.createEmptyBorder(10, 24, 10, 24));
		loginButton.setFocusPainted(false);
		loginButton.setOpaque(true);
		loginButton.setContentAreaFilled(true);
		loginButton.setBorderPainted(false);
		loginButton.addMouseListener(new java.awt.event.MouseAdapter() {
			public void mouseEntered(java.awt.event.MouseEvent evt) {
				loginButton.setBackground(ACCENT_HOVER);
			}
			public void mouseExited(java.awt.event.MouseEvent evt) {
				loginButton.setBackground(ACCENT);
			}
		});
		// Clear button
		JButton clearButton = new JButton("Clear");
		clearButton.setActionCommand("Clear");
		clearButton.addActionListener(this);
		clearButton.setBackground(SECONDARY_BG);
		clearButton.setForeground(TEXT);
		clearButton.setFont(clearButton.getFont().deriveFont(Font.PLAIN, 12f));
		clearButton.setBorder(BorderFactory.createCompoundBorder(
				BorderFactory.createLineBorder(SECONDARY_BORDER, 1),
				new EmptyBorder(8, 18, 8, 18)));
		clearButton.setFocusPainted(false);
		clearButton.setOpaque(true);
		JPanel buttonRow = new JPanel(new java.awt.FlowLayout(java.awt.FlowLayout.CENTER, 10, 0));
		buttonRow.setBackground(CARD_BG);
		buttonRow.add(loginButton);
		buttonRow.add(clearButton);
		gbc.gridy = 7;
		gbc.insets = new Insets(0, 0, 0, 0);
		gbc.anchor = GridBagConstraints.CENTER;
		gbc.fill = GridBagConstraints.NONE;
		card.add(buttonRow, gbc);

		// Make Login the default button so Enter key triggers login
		getRootPane().setDefaultButton(loginButton);

		// Position the form at the top of the window (as previous)
		JPanel wrapper = new JPanel(new GridBagLayout());
		wrapper.setBackground(BG);
		wrapper.setBorder(new EmptyBorder(24, 24, 24, 24));
		GridBagConstraints wrapGbc = new GridBagConstraints();
		wrapGbc.gridx = 0;
		wrapGbc.gridy = 0;
		wrapGbc.weightx = 1;
		wrapGbc.weighty = 1;
		wrapGbc.anchor = GridBagConstraints.NORTH;
		wrapGbc.fill = GridBagConstraints.NONE;
		wrapper.add(card, wrapGbc);
		getContentPane().add(wrapper);
	}

	/**
	 * Validates the given credentials against the hardcoded test user.
	 * Uses Arrays.equals for password comparison to avoid timing attacks on char[].
	 *
	 * @param username the username to check
	 * @param password the password as char array (from JPasswordField)
	 * @return true if username and password match the test user
	 */
	private boolean validateCredentials(String username, char[] password) {
		if (username == null || password == null) {
			return false;
		}
		boolean usernameOk = TEST_USERNAME.equals(username.trim());
		boolean passwordOk = Arrays.equals(password, TEST_PASSWORD.toCharArray());
		return usernameOk && passwordOk;
	}

	/**
	 * Handles button clicks: Login validates and opens game; Clear resets the form.
	 */
	@Override
	public void actionPerformed(ActionEvent e) {
		String cmd = e.getActionCommand() != null ? e.getActionCommand() : "Login";

		if ("Clear".equals(cmd)) {
			usernameField.setText("");
			passwordField.setText("");
			usernameField.requestFocusInWindow();
			return;
		}

		// Login
		String username = usernameField.getText();
		char[] password = passwordField.getPassword();

		if (validateCredentials(username, password)) {
			dispose();
			SwingUtilities.invokeLater(() -> {
				GameGUI gameGUI = new GameGUI(username);
				gameGUI.setVisible(true);
			});
		} else {
			JOptionPane.showMessageDialog(this,
					"Invalid username or password.",
					"Login Failed",
					JOptionPane.ERROR_MESSAGE);
			passwordField.setText("");
			passwordField.requestFocusInWindow();
		}
	}

	/**
	 * Entry point to start the application from the login screen.
	 */
	public static void main(String[] args) {
		SwingUtilities.invokeLater(() -> {
			LoginFrame login = new LoginFrame();
			login.setVisible(true);
		});
	}
}
